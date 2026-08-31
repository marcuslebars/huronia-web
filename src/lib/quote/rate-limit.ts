/**
 * Per-IP rate limit for POST /api/quote (§8).
 *
 * IN-MEMORY AND PER-INSTANCE. On Vercel each serverless instance keeps its own
 * counter, so the effective limit across a scaled-out deployment is higher than
 * the number below, and it resets on cold start. That is acceptable for a
 * low-traffic quote form whose real spam defence is the honeypot, but it is not
 * a security control.
 *
 * TODO (Phase 8): move to a durable store (Vercel KV / Upstash) before this
 * sees real traffic, and tighten the limit once we know normal volume.
 */

const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5
const MAX_TRACKED_IPS = 5_000

type Bucket = { count: number; expiresAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult = {
  readonly allowed: boolean
  readonly remaining: number
  /** Seconds until the window resets. */
  readonly retryAfter: number
}

export function rateLimit(ip: string, now = Date.now()): RateLimitResult {
  // Opportunistic sweep; keeps the map from growing without bound.
  if (buckets.size > MAX_TRACKED_IPS) {
    for (const [key, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(key)
    }
  }

  const existing = buckets.get(ip)

  if (existing === undefined || existing.expiresAt <= now) {
    buckets.set(ip, { count: 1, expiresAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0 }
  }

  existing.count += 1
  const retryAfter = Math.ceil((existing.expiresAt - now) / 1000)

  if (existing.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: MAX_REQUESTS - existing.count, retryAfter }
}

/** Test seam. */
export function resetRateLimit(): void {
  buckets.clear()
}

/**
 * Trusts x-forwarded-for only because Vercel rewrites it at the edge. Behind a
 * different proxy this would need revisiting.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && first !== '' ? first : (headers.get('x-real-ip') ?? 'unknown')
}
