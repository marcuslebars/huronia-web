import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 4 gate — PROJECT_BRIEF.md §10: "add to cart, change quantity, remove,
 * reach a live Shopify checkout URL".
 *
 * The first three are asserted here in full. The fourth is NOT: the store has
 * no products and no Storefront access token, so there is no live checkout to
 * reach. What is asserted instead is that the checkout control is wired to
 * whatever checkoutUrl the cart returns — the fixture cart deliberately returns
 * a fixture.invalid URL so a passing test can never be mistaken for proof that
 * the real handoff works.
 */

/** The one priced fixture. Quote-only products have no add-to-cart at all. */
const PRICED = '/shop/batteries/batteries-sample-1'

const drawer = (page: Page) => page.getByRole('dialog')

async function addOne(page: Page) {
  await page.goto(PRICED)
  await page.getByRole('main').getByRole('button', { name: 'Add to cart' }).click()
  await expect(drawer(page)).toBeVisible()
}

test.describe('Cart', () => {
  test('add, change quantity, remove', async ({ page }) => {
    await addOne(page)

    const quantity = drawer(page).getByRole('group', { name: /Quantity/ })
    await expect(quantity.getByRole('status')).toHaveText('1')
    // Line total and subtotal are both $189.99 at quantity 1, so target the subtotal.
    const subtotal = drawer(page).getByTestId('cart-subtotal')
    await expect(subtotal).toHaveText('$189.99')

    // Increase
    await drawer(page).getByRole('button', { name: 'Increase quantity' }).click()
    await expect(quantity.getByRole('status')).toHaveText('2')
    await expect(subtotal).toHaveText('$379.98')

    // Decrease
    await drawer(page).getByRole('button', { name: 'Decrease quantity' }).click()
    await expect(quantity.getByRole('status')).toHaveText('1')

    // Remove
    await drawer(page)
      .getByRole('button', { name: /^Remove/ })
      .click()
    await expect(drawer(page).getByText('Your cart is empty')).toBeVisible()
  })

  test('the header count reflects the cart and survives navigation', async ({ page }) => {
    await addOne(page)
    await page.keyboard.press('Escape')

    const cartButton = page.getByRole('button', { name: /Open cart/ })
    await expect(cartButton).toContainText('1')

    // The cart id is in an httpOnly cookie, so it must outlive a page load.
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Open cart/ })).toContainText('1')
  })

  test('the cart id cookie is httpOnly and unreadable from JavaScript', async ({
    page,
    context,
  }) => {
    await addOne(page)

    const cookie = (await context.cookies()).find((entry) => entry.name === 'cartId')
    expect(cookie, 'no cartId cookie was set').toBeTruthy()
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.sameSite).toBe('Lax')

    // A cart id is a capability: whoever holds it can read that cart.
    const visible = await page.evaluate(() => document.cookie)
    expect(visible).not.toContain('cartId')
  })

  test('the cart page shows the same lines as the drawer', async ({ page }) => {
    await addOne(page)
    await page.goto('/cart')

    const main = page.getByRole('main')
    // By test id: the title also appears in the Remove button's screen-reader text.
    await expect(main.getByTestId('cart-line-title')).toHaveText('Batteries sample 1')
    await expect(main.getByTestId('cart-subtotal')).toHaveText('$189.99')
  })

  test('an empty cart offers the shop and a quote instead of a checkout', async ({
    page,
  }) => {
    await page.goto('/cart')
    const main = page.getByRole('main')

    await expect(main.getByText('Your cart is empty')).toBeVisible()
    await expect(main.getByRole('link', { name: 'Browse the shop' })).toBeVisible()
    // The catalogue is quote-only, so a quote is the real next step (§13.1).
    await expect(main.getByRole('link', { name: 'Request a quote' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Checkout' })).toHaveCount(0)
  })

  test('checkout hands off to the cart checkoutUrl, not a page we render', async ({
    page,
  }) => {
    await addOne(page)

    const href = await drawer(page)
      .getByRole('link', { name: 'Checkout' })
      .getAttribute('href')

    // With a real Storefront token this is a shopify.com checkout. Until then
    // it is deliberately an invalid host, so this test cannot be misread as
    // proof that the live handoff works.
    expect(href).toContain('fixture.invalid/checkout/')
    expect(href).not.toContain('/cart')
  })

  test('a quote-only product has no way into the cart at all', async ({ page }) => {
    await page.goto('/shop/wheels-tires/wheels-tires-sample-2')
    const main = page.getByRole('main')

    await expect(main.getByRole('button', { name: 'Add to cart' })).toHaveCount(0)
    await expect(main.getByRole('link', { name: 'Request a quote' })).toBeVisible()
  })
})
