/**
 * Shop copy — PROJECT_BRIEF.md §6.
 *
 * Nothing here quotes a price. The whole catalogue is quote-only until the
 * client's pricing file arrives (§13.1), and the copy is written for that being
 * the normal state rather than an apology for a missing feature.
 */
export const shop = {
  index: {
    title: 'Truck & Trailer Accessories',
    metaDescription:
      'Wheels, tires, truck caps, lift kits, hitches, plows and batteries, supplied and fitted in Midland, Ontario. Ask us for a price.',
    heading: 'Shop',
    intro:
      'Parts and accessories for trucks, trailers and work vehicles. Most of the catalogue is quoted rather than priced online, so tell us what you are looking at and we will come back with a number.',
  },

  collection: {
    /** Shown when a collection has no products at all. */
    emptyHeading: 'Nothing here yet',
    emptyBody:
      'This part of the catalogue is still being brought across. Tell us what you are after and we will source it.',
    /** Shown when filters exclude everything. */
    noMatchesHeading: 'No matches',
    noMatchesBody: 'Nothing in this collection matches those filters.',
    clearFilters: 'Clear filters',
  },

  filters: {
    heading: 'Filter',
    brand: 'Brand',
    allBrands: 'All brands',
    sort: 'Sort',
    availability: 'Availability',
    inStockOnly: 'In stock only',
    apply: 'Apply',
  },

  sortOptions: [
    { value: 'featured', label: 'Featured' },
    { value: 'title-asc', label: 'Name, A to Z' },
    { value: 'title-desc', label: 'Name, Z to A' },
  ],

  product: {
    quoteCta: 'Request a quote',
    addToCart: 'Add to cart',
    soldOut: 'Sold out',
    /** Replaces the price for quote-only items. Never "$0.00", never "Free". */
    quoteOnly: 'Price on request',
    quoteHelp:
      'We quote this one rather than listing a price, because it depends on the vehicle and the fit.',
    vendorLabel: 'Brand',
    optionsHeading: 'Options',
    detailsHeading: 'Details',
    backToCollection: 'Back to',
  },

  pagination: {
    next: 'Next page',
    previous: 'Previous page',
  },

  /** §13.3: there is no photography, so every image slot needs this. */
  imagePlaceholderLabel: 'No photograph yet',
} as const
