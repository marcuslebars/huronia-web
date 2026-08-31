import { z } from 'zod'
import { ShopifyError, storefront, usingFixtures } from '@/lib/shopify/client'
import {
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  COLLECTION_QUERY,
  PRODUCT_HANDLES_QUERY,
  PRODUCT_QUERY,
} from '@/lib/shopify/queries'
import {
  rawCollectionSchema,
  rawProductSchema,
  toCollection,
  toProduct,
} from '@/lib/shopify/transforms'
import type { Collection, Product, ProductPage } from '@/types/catalogue'

/**
 * The only module the app imports for catalogue data (CLAUDE.md hard rule 2).
 * Everything below returns our own domain types; no Shopify shape escapes.
 */

export { ShopifyError, usingFixtures }

/** Cache tags, so the Shopify webhook can revalidate precisely (§7). */
export const CACHE_TAGS = {
  collections: 'collections',
  collection: (handle: string) => `collection:${handle}`,
  product: (handle: string) => `product:${handle}`,
} as const

const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
})

export async function getCollections(): Promise<readonly Collection[]> {
  const data = await storefront<unknown>(
    COLLECTIONS_QUERY,
    { first: 50 },
    { tags: [CACHE_TAGS.collections] },
  )

  const parsed = z
    .object({ collections: z.object({ nodes: z.array(rawCollectionSchema) }) })
    .parse(data)

  return parsed.collections.nodes.map(toCollection)
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const data = await storefront<unknown>(
    COLLECTION_QUERY,
    { handle },
    { tags: [CACHE_TAGS.collection(handle)] },
  )

  const parsed = z.object({ collection: rawCollectionSchema.nullable() }).parse(data)
  return parsed.collection ? toCollection(parsed.collection) : null
}

export async function getCollectionProducts(
  handle: string,
  options: { first?: number; after?: string | null } = {},
): Promise<ProductPage | null> {
  const data = await storefront<unknown>(
    COLLECTION_PRODUCTS_QUERY,
    { handle, first: options.first ?? 24, after: options.after ?? null },
    { tags: [CACHE_TAGS.collection(handle)] },
  )

  const parsed = z
    .object({
      collection: z
        .object({
          products: z.object({
            nodes: z.array(rawProductSchema),
            pageInfo: pageInfoSchema,
          }),
        })
        .nullable(),
    })
    .parse(data)

  if (parsed.collection === null) return null

  return {
    products: parsed.collection.products.nodes.map(toProduct),
    hasNextPage: parsed.collection.products.pageInfo.hasNextPage,
    endCursor: parsed.collection.products.pageInfo.endCursor,
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<unknown>(
    PRODUCT_QUERY,
    { handle },
    { tags: [CACHE_TAGS.product(handle)] },
  )

  const parsed = z.object({ product: rawProductSchema.nullable() }).parse(data)
  return parsed.product ? toProduct(parsed.product) : null
}

/** Every handle, for generateStaticParams. Pages through the whole catalogue. */
export async function getAllProductHandles(): Promise<readonly string[]> {
  const handles: string[] = []
  let after: string | null = null

  // Bounded so a pagination bug cannot spin forever: 250 x 20 covers a
  // catalogue several times the size of the current 311 products.
  for (let page = 0; page < 20; page += 1) {
    const data: unknown = await storefront<unknown>(
      PRODUCT_HANDLES_QUERY,
      { first: 250, after },
      { tags: [CACHE_TAGS.collections] },
    )

    const parsed = z
      .object({
        products: z.object({
          nodes: z.array(z.object({ handle: z.string() })),
          pageInfo: pageInfoSchema,
        }),
      })
      .parse(data)

    handles.push(...parsed.products.nodes.map((node) => node.handle))

    if (!parsed.products.pageInfo.hasNextPage) return handles
    after = parsed.products.pageInfo.endCursor
  }

  return handles
}
