export type TrustItem = {
  readonly label: string
  readonly value: string
}

export type TrustStripProps = {
  items: readonly TrustItem[]
}

/** A row of verifiable facts. Every value must trace to §4 — no soft claims. */
export function TrustStrip({ items }: TrustStripProps) {
  return (
    <section
      data-surface="panel"
      className="border-y border-[var(--surface-line)] px-4 sm:px-6"
    >
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-[var(--surface-muted)]">{item.label}</dt>
            <dd className="font-heading mt-1 text-xl font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
