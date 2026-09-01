'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AddToCartButton } from '@/components/shop/AddToCartButton'
import { Price } from '@/components/shop/Price'
import { cn } from '@/lib/cn'
import type { Product, ProductVariant } from '@/types/catalogue'

export type VariantPickerProps = {
  product: Product
  labels: {
    optionsHeading: string
    quoteOnly: string
    quoteCta: string
    quoteHelp: string
    addToCart: string
    soldOut: string
    adding: string
    callLabel: string
  }
  telHref: string
}

/** Shopify's placeholder option for a product with no real options. */
const isDefaultOption = (product: Product): boolean =>
  product.options.length === 1 &&
  product.options[0]?.name === 'Title' &&
  product.options[0]?.values.length === 1

function matches(variant: ProductVariant, selection: Record<string, string>): boolean {
  return variant.selectedOptions.every(
    (option) => selection[option.name] === option.value,
  )
}

export function VariantPicker({ product, labels, telHref }: VariantPickerProps) {
  const showOptions = !isDefaultOption(product)

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first =
      product.variants.find((variant) => variant.available) ?? product.variants[0]
    return Object.fromEntries(
      (first?.selectedOptions ?? []).map((option) => [option.name, option.value]),
    )
  })

  const selected =
    product.variants.find((variant) => matches(variant, selection)) ?? product.variants[0]

  const price = selected?.price ?? product.price
  const quoteOnly = price === null
  const available = selected?.available ?? false

  return (
    <div>
      <p className="font-heading text-2xl font-semibold">
        <Price
          price={price}
          currencyCode={product.currencyCode}
          quoteOnlyLabel={labels.quoteOnly}
        />
      </p>

      {showOptions ? (
        <div className="mt-6">
          <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">
            {labels.optionsHeading}
          </h2>
          {product.options.map((option) => (
            <fieldset key={option.name} className="mt-3">
              <legend className="text-sm text-[var(--surface-muted)]">
                {option.name}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const candidate = { ...selection, [option.name]: value }
                  const variant = product.variants.find((entry) =>
                    matches(entry, candidate),
                  )
                  const checked = selection[option.name] === value

                  return (
                    <label
                      key={value}
                      className={cn(
                        'cursor-pointer rounded-md border px-4 py-2 text-sm transition-colors',
                        checked
                          ? 'border-[var(--color-accent)] bg-[var(--btn-subtle-hover)]'
                          : 'border-[var(--surface-line)] hover:bg-[var(--btn-subtle-hover)]',
                        variant?.available === false &&
                          'text-[var(--surface-muted)] line-through',
                      )}
                    >
                      <input
                        type="radio"
                        name={option.name}
                        value={value}
                        checked={checked}
                        onChange={() => setSelection(candidate)}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {quoteOnly ? (
          <>
            {/* No add-to-cart for a quote-only product (§7). */}
            <Button href={`/quote?product=${product.handle}`} size="lg">
              {labels.quoteCta}
            </Button>
            <Button href={telHref} size="lg" variant="secondary">
              {labels.callLabel}
            </Button>
          </>
        ) : (
          <AddToCartButton
            variantId={selected?.id ?? ''}
            available={available}
            labels={{
              addToCart: labels.addToCart,
              soldOut: labels.soldOut,
              adding: labels.adding,
            }}
          />
        )}
      </div>

      {quoteOnly ? (
        <p className="max-w-measure mt-4 text-sm text-[var(--surface-muted)]">
          {labels.quoteHelp}
        </p>
      ) : null}
    </div>
  )
}
