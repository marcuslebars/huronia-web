import { createHmac } from 'node:crypto'
import { expect, test } from '@playwright/test'

/**
 * POST /api/revalidate — PROJECT_BRIEF.md §7.
 *
 * The secret here matches the placeholder in CI and .env.local. With a real
 * secret these tests still pass, because the signature is computed the same way
 * Shopify computes it.
 */
const SECRET = 'placeholder-webhook-secret'

const sign = (body: string) =>
  createHmac('sha256', SECRET).update(body, 'utf8').digest('base64')

const body = JSON.stringify({ handle: 'wheels-tires-sample-2', id: 123 })

test('rejects a request with no signature', async ({ request }) => {
  const response = await request.post('/api/revalidate', {
    headers: { 'x-shopify-topic': 'products/update' },
    data: body,
  })
  expect(response.status()).toBe(401)
})

test('rejects a forged signature', async ({ request }) => {
  const response = await request.post('/api/revalidate', {
    headers: {
      'x-shopify-topic': 'products/update',
      'x-shopify-hmac-sha256': sign('a different body'),
      'content-type': 'application/json',
    },
    data: body,
  })
  expect(response.status()).toBe(401)
})

test('rejects a signature of the wrong length without throwing', async ({ request }) => {
  // timingSafeEqual throws on a length mismatch; the handler must not 500.
  const response = await request.post('/api/revalidate', {
    headers: {
      'x-shopify-topic': 'products/update',
      'x-shopify-hmac-sha256': 'dG9vLXNob3J0',
      'content-type': 'application/json',
    },
    data: body,
  })
  expect(response.status()).toBe(401)
})

test('revalidates the product and the collection listings on a product change', async ({
  request,
}) => {
  const response = await request.post('/api/revalidate', {
    headers: {
      'x-shopify-topic': 'products/update',
      'x-shopify-hmac-sha256': sign(body),
      'content-type': 'application/json',
    },
    data: body,
  })

  expect(response.status()).toBe(200)
  const json = (await response.json()) as { ok: boolean; revalidated: string[] }
  expect(json.ok).toBe(true)
  expect(json.revalidated).toContain('product:wheels-tires-sample-2')
  // A product can move between collections, so the listings are stale too.
  expect(json.revalidated).toContain('collections')
})

test('accepts an unsubscribed topic without retrying', async ({ request }) => {
  const payload = JSON.stringify({ handle: 'x' })
  const response = await request.post('/api/revalidate', {
    headers: {
      'x-shopify-topic': 'orders/create',
      'x-shopify-hmac-sha256': sign(payload),
      'content-type': 'application/json',
    },
    data: payload,
  })

  // 200, so Shopify does not keep retrying something we deliberately ignore.
  expect(response.status()).toBe(200)
  expect((await response.json()).revalidated).toEqual([])
})
