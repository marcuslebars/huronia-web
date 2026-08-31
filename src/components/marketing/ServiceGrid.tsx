import Link from 'next/link'
import type { ServiceSummary } from '@/types/content'

export type ServiceGridProps = {
  services: readonly ServiceSummary[]
}

export function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-lg border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => (
        <li key={service.slug} data-surface="paper" className="group">
          <Link
            href={`/services/${service.slug}`}
            className="flex h-full flex-col p-6 transition-colors hover:bg-[var(--btn-subtle-hover)]"
          >
            <h3 className="font-heading text-lg font-semibold group-hover:text-[var(--surface-link)]">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--surface-muted)]">{service.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
