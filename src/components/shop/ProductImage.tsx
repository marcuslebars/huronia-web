import NextImage from 'next/image'
import { cn } from '@/lib/cn'
import type { ProductImage as ProductImageType } from '@/types/catalogue'

export type ProductImageProps = {
  image: ProductImageType | null
  /** Falls back to the product title when the image has no alt text. */
  fallbackAlt: string
  placeholderLabel: string
  sizes: string
  priority?: boolean
  /** Icon only. The label does not fit in a thumbnail and gets clipped. */
  compact?: boolean
  className?: string
}

/**
 * A product image, or a designed placeholder.
 *
 * There is not one photograph of the shop, the team or finished work (§13.3),
 * so the placeholder is the normal case rather than an error state. It has to
 * look deliberate — an empty box or a broken-image icon reads as a broken site.
 */
export function ProductImage({
  image,
  fallbackAlt,
  placeholderLabel,
  sizes,
  priority,
  compact,
  className,
}: ProductImageProps) {
  if (image === null) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden bg-[var(--color-panel)]',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 p-2 text-center sm:p-6">
          {/* A pane of glass: on-theme, and clearly not a failed image. */}
          <svg
            viewBox="0 0 48 40"
            aria-hidden="true"
            className="h-10 w-12 text-[var(--color-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 8 L44 8 L40 34 L8 34 Z" />
            <path d="M12 8 L9 34" opacity="0.5" />
            <path d="M28 8 L27 34" opacity="0.5" />
          </svg>
          {compact ? (
            <span className="sr-only">{placeholderLabel}</span>
          ) : (
            <span className="text-xs text-[var(--color-muted)]">{placeholderLabel}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <NextImage
      src={image.url}
      alt={image.altText ?? fallbackAlt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
