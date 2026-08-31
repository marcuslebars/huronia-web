import { collections as collectionContent } from '@/content/collections'
import {
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  COLLECTION_QUERY,
  PRODUCT_HANDLES_QUERY,
  PRODUCT_QUERY,
} from '@/lib/shopify/queries'

/**
 * Stand-in catalogue data, used only until real Shopify credentials exist.
 *
 * Deliberately shaped like the real catalogue rather than like a nice demo:
 *
 * - Every product is priced "0.0". All 311 products in the real store are $0.00
 *   (§13.1), so quote-only is the default state the UI must handle, not a
 *   fallback. Exactly one product carries a real price, and it exists only so
 *   the priced code path and Phase 4's cart are exercisable at all.
 * - Every product has no images. There is not one photograph of the shop, the
 *   team or finished work (§13.3), so the placeholder path is the normal path.
 * - Vendors are obviously synthetic. They must never be mistaken for brands the
 *   business actually stocks.
 *
 * Written against Shopify's documented Storefront schema, not recorded from the
 * real store, so field-level surprises are still possible. The zod validation
 * in transforms.ts is what will catch them.
 */

const CURRENCY = 'CAD'

const VENDORS = ['Sample Brand A', 'Sample Brand B', 'Sample Brand C'] as const

/** The one priced product. See the note above. */
const PRICED_HANDLE = 'batteries-sample-1'

type FixtureImage = null

function money(amount: string) {
  return { amount, currencyCode: CURRENCY }
}

function buildProduct(collectionHandle: string, index: number) {
  const handle = `${collectionHandle}-sample-${index}`
  const priced = handle === PRICED_HANDLE
  const amount = priced ? '189.99' : '0.0'
  const vendor = VENDORS[index % VENDORS.length] ?? VENDORS[0]

  const collection = collectionContent.find((entry) => entry.slug === collectionHandle)
  const title = `${collection?.title ?? collectionHandle} sample ${index}`

  // A couple of products carry options so the variant picker has something to
  // do; the rest are single-variant, like most of the real catalogue.
  const hasOptions = index % 3 === 0
  const sizes = ['17 in', '18 in', '20 in']

  const variants = hasOptions
    ? sizes.map((size, position) => ({
        id: `gid://shopify/ProductVariant/${handle}-${position}`,
        title: size,
        availableForSale: position !== sizes.length - 1,
        price: money(amount),
        selectedOptions: [{ name: 'Size', value: size }],
      }))
    : [
        {
          id: `gid://shopify/ProductVariant/${handle}-0`,
          title: 'Default Title',
          availableForSale: true,
          price: money(amount),
          selectedOptions: [{ name: 'Title', value: 'Default Title' }],
        },
      ]

  const featuredImage: FixtureImage = null

  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title,
    description: `Placeholder listing for ${title}. Real catalogue copy arrives with the Shopify import.`,
    descriptionHtml: `<p>Placeholder listing for ${title}. Real catalogue copy arrives with the Shopify import.</p>`,
    vendor,
    availableForSale: variants.some((variant) => variant.availableForSale),
    options: hasOptions
      ? [{ name: 'Size', optionValues: sizes.map((size) => ({ name: size })) }]
      : [{ name: 'Title', optionValues: [{ name: 'Default Title' }] }],
    featuredImage,
    images: { nodes: [] },
    priceRange: {
      minVariantPrice: money(amount),
      maxVariantPrice: money(amount),
    },
    variants: { nodes: variants },
  }
}

const PRODUCTS_PER_COLLECTION = 7

const productsByCollection = new Map(
  collectionContent.map((collection) => [
    collection.slug,
    Array.from({ length: PRODUCTS_PER_COLLECTION }, (_unused, index) =>
      buildProduct(collection.slug, index + 1),
    ),
  ]),
)

const allProducts = [...productsByCollection.values()].flat()

const collectionNodes = collectionContent.map((collection) => ({
  id: `gid://shopify/Collection/${collection.slug}`,
  handle: collection.slug,
  title: collection.title,
  description: '',
  image: null,
}))

type Variables = Record<string, unknown>

function collectionProductsPage(variables: Variables) {
  const handle = String(variables.handle ?? '')
  const first = Number(variables.first ?? 24)
  const after = variables.after == null ? null : String(variables.after)

  const products = productsByCollection.get(handle)
  if (products === undefined) return { collection: null }

  const start = after === null ? 0 : Number.parseInt(after, 10) + 1
  const slice = products.slice(start, start + first)
  const end = start + slice.length - 1

  return {
    collection: {
      products: {
        nodes: slice,
        pageInfo: {
          hasNextPage: start + slice.length < products.length,
          endCursor: slice.length > 0 ? String(end) : null,
        },
      },
    },
  }
}

export function hasFixture(query: string, variables: Variables): boolean {
  if (query === COLLECTIONS_QUERY || query === PRODUCT_HANDLES_QUERY) return true
  if (query === COLLECTION_QUERY || query === COLLECTION_PRODUCTS_QUERY) return true
  if (query === PRODUCT_QUERY) return true
  void variables
  return false
}

export function fixtureFor(query: string, variables: Variables): unknown {
  if (query === COLLECTIONS_QUERY) {
    return { collections: { nodes: collectionNodes } }
  }

  if (query === COLLECTION_QUERY) {
    const handle = String(variables.handle ?? '')
    return { collection: collectionNodes.find((node) => node.handle === handle) ?? null }
  }

  if (query === COLLECTION_PRODUCTS_QUERY) {
    return collectionProductsPage(variables)
  }

  if (query === PRODUCT_QUERY) {
    const handle = String(variables.handle ?? '')
    return { product: allProducts.find((product) => product.handle === handle) ?? null }
  }

  if (query === PRODUCT_HANDLES_QUERY) {
    return {
      products: {
        nodes: allProducts.map((product) => ({ handle: product.handle })),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }
  }

  throw new Error('No fixture for this query')
}
