/**
 * Per-IP rate limit for POST /api/quote (§8).
 *
 * IN-MEMORY AND PER-INSTANCE. Every server instance keeps its own counter, so
 * the effective limit across more than one replica is a multiple of the number
 * below, and it resets whenever the process restarts or a deploy rolls. That is
 * acceptable for a low-traffic quote form whose real spam defence is the
 * honeypot, but it is not a security control.
 *
 * TODO (Phase 8): move to a durable store (Redis / Upstash) before this sees
 * real traffic, and tighten the limit once we know normal volume.
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
 * Reads x-forwarded-for, which the platform proxy sets. A client can forge this
 * header if requests can reach the app without passing through that proxy, so
 * treat the limit as protection against accidents and crawlers, not abuse.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && first !== '' ? first : (headers.get('x-real-ip') ?? 'unknown')
}
