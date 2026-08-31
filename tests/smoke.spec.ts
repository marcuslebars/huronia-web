import { expect, test } from '@playwright/test'

test.describe('Phase 0 foundation', () => {
  test('home responds 200 and renders server-side', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('the document arrives with content already in the HTML', async ({ request }) => {
    // Server rendering is the whole reason this stack was chosen (§2).
    // Assert against the raw response, before any JavaScript runs.
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('Huronia Auto Glass')
  })

  test('an unknown route returns a real 404', async ({ request }) => {
    const response = await request.get('/this-route-does-not-exist')
    expect(response.status()).toBe(404)
  })
})
