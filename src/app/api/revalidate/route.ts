import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { serverEnv } from '@/lib/env'
import { CACHE_TAGS } from '@/lib/shopify'

export const runtime = 'nodejs'

/**
 * Shopify webhook target — PROJECT_BRIEF.md §7.
 *
 * Products and collections are cached for an hour, so without this a price or
 * stock change waits up to that long to appear. Shopify posts here on change
 * and the matching tag is revalidated immediately.
 *
 * The body must be read as raw text: the HMAC is computed over the exact bytes
 * Shopify sent, so parsing to JSON first and re-serialising would not match.
 */

function isFromShopify(rawBody: string, signature: string | null): boolean {
  if (signature === null || signature === '') return false

  const expected = createHmac('sha256', serverEnv.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest()

  let received: Buffer
  try {
    received = Buffer.from(signature, 'base64')
  } catch {
    return false
  }

  // timingSafeEqual throws on a length mismatch, so check that first.
  if (received.length !== expected.length) return false
  return timingSafeEqual(received, expected)
}

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-shopify-hmac-sha256')

  if (!isFromShopify(rawBody, signature)) {
    // Deliberately terse: an unverified caller learns nothing about why.
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const topic = request.headers.get('x-shopify-topic') ?? ''

  let payload: { handle?: unknown }
  try {
    payload = JSON.parse(rawBody) as { handle?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed body' }, { status: 400 })
  }

  const handle = typeof payload.handle === 'string' ? payload.handle : null
  const revalidated: string[] = []

  // Next 16's revalidateTag takes a cacheLife profile. A webhook means the data
  // has already changed, so the cached entry expires immediately rather than
  // being allowed to serve stale for any window.
  const bump = (tag: string) => {
    revalidateTag(tag, { expire: 0 })
    revalidated.push(tag)
  }

  if (topic.startsWith('products/')) {
    if (handle !== null) bump(CACHE_TAGS.product(handle))
    // A product change can move it in or out of a collection, so the
    // collection listings are stale too.
    bump(CACHE_TAGS.collections)
  } else if (topic.startsWith('collections/')) {
    if (handle !== null) bump(CACHE_TAGS.collection(handle))
    bump(CACHE_TAGS.collections)
  } else {
    // Verified, but not a topic we subscribe to. 200 so Shopify does not retry.
    return NextResponse.json({ ok: true, revalidated: [] })
  }

  return NextResponse.json({ ok: true, revalidated })
}
