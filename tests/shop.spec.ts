import { expect, test } from '@playwright/test'
import { toPrice, toProduct } from '../src/lib/shopify/transforms'

/**
 * Phase 3 gates — PROJECT_BRIEF.md §10.
 *
 * The catalogue is still fixtures: no Shopify credentials exist yet. What is
 * asserted here is the behaviour those gates describe, against data shaped like
 * the real catalogue — every product $0.00 and imageless (§13.1, §13.3).
 */

/** Quote-only, like all 311 real products. */
const QUOTE_ONLY = '/shop/wheels-tires/wheels-tires-sample-2'
/** The one priced fixture, which exists purely to exercise the priced path. */
const PRICED = '/shop/batteries/batteries-sample-1'

test.describe('Quote-only products', () => {
  test('renders Request a quote and no buy button', async ({ page }) => {
    await page.goto(QUOTE_ONLY)
    // Scoped to main: the header and footer carry their own quote links.
    const main = page.getByRole('main')

    await expect(main.getByRole('link', { name: 'Request a quote' })).toBeVisible()
    await expect(main.getByRole('button', { name: 'Add to cart' })).toHaveCount(0)

    // A click-to-call alongside it (§7).
    await expect(page.getByRole('link', { name: /Call 705-526-7631/ })).toBeVisible()

    await expect(page.getByText('Price on request')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('$0.00')
    await expect(page.locator('body')).not.toContainText('Free')
  })

  test('the quote link carries the product handle', async ({ page }) => {
    await page.goto(QUOTE_ONLY)
    const href = await page
      .getByRole('main')
      .getByRole('link', { name: 'Request a quote' })
      .getAttribute('href')
    expect(href).toBe('/quote?product=wheels-tires-sample-2')
  })

  test('omits the Offer from JSON-LD rather than emitting a zero price', async ({
    request,
  }) => {
    const html = await (await request.get(QUOTE_ONLY)).text()
    const blocks = [
      ...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g),
    ].map((match) => JSON.parse((match[1] ?? '').replaceAll('\\u003c', '<')))

    const product = blocks.find((node) => node['@type'] === 'Product')
    expect(product, 'no Product schema').toBeTruthy()
    // Still indexed, still fully described — it just makes no price claim (§7).
    expect(product.name).toBeTruthy()
    expect(product.offers).toBeUndefined()
  })

  test('a priced product does show a price and a buy button', async ({ page }) => {
    await page.goto(PRICED)
    const main = page.getByRole('main')
    await expect(main.getByRole('button', { name: 'Add to cart' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Request a quote' })).toHaveCount(0)
    await expect(main.getByText('$189.99')).toBeVisible()
  })
})

test.describe('Collection filters live in the URL', () => {
  const COLLECTION = '/shop/wheels-tires'

  test('a brand filter survives a refresh', async ({ page }) => {
    await page.goto(COLLECTION)
    const before = await page.getByTestId('product-grid').locator('li').count()

    await page.getByLabel('Brand').selectOption('Sample Brand B')
    await expect(page).toHaveURL(/brand=Sample\+Brand\+B|brand=Sample%20Brand%20B/)

    const filtered = await page.getByTestId('product-grid').locator('li').count()
    expect(filtered).toBeLessThan(before)

    // The gate: reload, and the filter is still applied.
    await page.reload()
    await expect(page.getByLabel('Brand')).toHaveValue('Sample Brand B')
    expect(await page.getByTestId('product-grid').locator('li').count()).toBe(filtered)
  })

  test('sort survives a refresh and actually reorders', async ({ page }) => {
    await page.goto(COLLECTION)

    await page.getByLabel('Sort').selectOption('title-desc')
    await expect(page).toHaveURL(/sort=title-desc/)
    const descending = await page
      .getByTestId('product-grid')
      .locator('h3')
      .allInnerTexts()

    await page.reload()
    await expect(page.getByLabel('Sort')).toHaveValue('title-desc')
    expect(await page.getByTestId('product-grid').locator('h3').allInnerTexts()).toEqual(
      descending,
    )

    const sorted = [...descending].sort((a, b) => b.localeCompare(a))
    expect(descending).toEqual(sorted)
  })

  test('a filtered URL is shareable — it renders filtered on first load', async ({
    page,
  }) => {
    await page.goto(`${COLLECTION}?brand=Sample+Brand+A&sort=title-asc`)
    await expect(page.getByLabel('Brand')).toHaveValue('Sample Brand A')
    await expect(page.getByLabel('Sort')).toHaveValue('title-asc')

    const titles = await page.getByTestId('product-grid').locator('h3').allInnerTexts()
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)))
  })

  test('clearing filters returns to the unfiltered grid', async ({ page }) => {
    await page.goto(`${COLLECTION}?brand=Sample+Brand+A`)
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).toHaveURL(COLLECTION)
  })

  test('a nonsense filter value degrades to the unfiltered grid', async ({ page }) => {
    // A hand-edited URL should not 500.
    const response = await page.goto(`${COLLECTION}?sort=not-a-sort&page=-4`)
    expect(response?.status()).toBe(200)
    await expect(page.getByTestId('product-grid')).toBeVisible()
  })
})

test.describe('toPrice: the zero-to-null boundary', () => {
  // Not a browser test, but it is the rule the whole phase rests on.
  test('maps Shopify zero to quote-only, and keeps real prices', () => {
    expect(toPrice('0.0')).toBeNull()
    expect(toPrice('0')).toBeNull()
    expect(toPrice('0.00')).toBeNull()
    expect(toPrice('-5')).toBeNull()
    expect(toPrice('not a number')).toBeNull()
    expect(toPrice('189.99')).toBe(189.99)
    expect(toPrice('0.01')).toBe(0.01)
  })

  test('a product whose variants are all zero has a null price', () => {
    const raw = {
      id: 'gid://shopify/Product/x',
      handle: 'x',
      title: 'X',
      description: '',
      descriptionHtml: '',
      vendor: '',
      availableForSale: true,
      options: [{ name: 'Title', optionValues: [{ name: 'Default Title' }] }],
      featuredImage: null,
      images: { nodes: [] },
      priceRange: {
        minVariantPrice: { amount: '0.0', currencyCode: 'CAD' },
        maxVariantPrice: { amount: '0.0', currencyCode: 'CAD' },
      },
      variants: {
        nodes: [
          {
            id: 'v1',
            title: 'Default Title',
            availableForSale: true,
            price: { amount: '0.0', currencyCode: 'CAD' },
            selectedOptions: [{ name: 'Title', value: 'Default Title' }],
          },
        ],
      },
    }

    const product = toProduct(raw)
    expect(product.price).toBeNull()
    expect(product.priceRange).toBeNull()
    // An empty vendor string becomes null rather than rendering as a blank label.
    expect(product.vendor).toBeNull()
  })
})
