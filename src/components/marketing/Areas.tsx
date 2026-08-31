import Link from 'next/link'
import type { Town } from '@/types/content'

export type AreasProps = {
  towns: readonly Town[]
}

export function Areas({ towns }: AreasProps) {
  return (
    <ul className="flex flex-wrap gap-3">
      {towns.map((town) => (
        <li key={town.slug}>
          <Link
            href={`/areas/${town.slug}`}
            className="inline-flex rounded-md border border-[var(--surface-line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--btn-subtle-hover)]"
          >
            {town.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
