/**
 * Storefront API GraphQL documents.
 *
 * Kept as plain strings rather than a codegen pipeline: there are five of them,
 * and a generator would be more machinery than the queries are worth.
 */

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    availableForSale
    options {
      name
      optionValues {
        name
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 12) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
    }
  }
`

export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query CollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export const PRODUCT_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`

export const PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query ProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        handle
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`
