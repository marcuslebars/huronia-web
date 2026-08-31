import type { Review } from '@/types/content'

export type ReviewsProps = {
  reviews: readonly Review[]
}

/** Five filled stars. Decorative — the rating is stated in text for assistive tech. */
function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-[var(--color-signal)]">
      <span aria-hidden="true">{'★'.repeat(rating)}</span>
      <span className="sr-only">{rating} out of 5</span>
    </p>
  )
}

export function Reviews({ reviews }: ReviewsProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col rounded-lg border border-[var(--surface-line)] p-6"
        >
          <Stars rating={review.rating} />
          <blockquote className="mt-3 flex-1">
            <p className="text-[var(--surface-fg)]">{review.body}</p>
          </blockquote>
          <footer className="mt-4 text-sm text-[var(--surface-muted)]">
            <cite className="font-medium text-[var(--surface-fg)] not-italic">
              {review.author}
            </cite>
            {review.location ? <span>, {review.location}</span> : null}
            {review.displayDate && review.date ? (
              <>
                <span aria-hidden="true"> &middot; </span>
                <time dateTime={review.date}>{review.displayDate}</time>
              </>
            ) : null}
          </footer>
        </li>
      ))}
    </ul>
  )
}
