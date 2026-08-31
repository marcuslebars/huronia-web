'use client'

import Link from 'next/link'
import { useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { ui } from '@/content/ui'
import type { NavSection } from '@/types/content'

export type MegaMenuProps = {
  sections: readonly NavSection[]
}

/**
 * Desktop dropdown navigation.
 *
 * Each trigger is a real <button> with aria-expanded and aria-controls. Escape
 * closes and returns focus to the trigger; moving focus out of the group closes
 * it. Hover opens it too, but hover is never the only way in.
 */
export function MegaMenu({ sections }: MegaMenuProps) {
  const [openHeading, setOpenHeading] = useState<string | null>(null)
  const baseId = useId()
  const containerRef = useRef<HTMLUListElement>(null)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  function close(restoreFocusTo?: string) {
    setOpenHeading(null)
    if (restoreFocusTo) triggerRefs.current.get(restoreFocusTo)?.focus()
  }

  return (
    <ul
      ref={containerRef}
      className="flex items-center gap-1"
      onMouseLeave={() => setOpenHeading(null)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && openHeading) {
          event.stopPropagation()
          close(openHeading)
        }
      }}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpenHeading(null)
        }
      }}
    >
      {sections.map((section) => {
        const panelId = `${baseId}-${section.heading.replace(/\s+/g, '-').toLowerCase()}`
        const isOpen = openHeading === section.heading

        return (
          <li
            key={section.heading}
            className="relative"
            onMouseEnter={() => setOpenHeading(section.heading)}
          >
            <button
              type="button"
              ref={(node) => {
                if (node) triggerRefs.current.set(section.heading, node)
                else triggerRefs.current.delete(section.heading)
              }}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenHeading(isOpen ? null : section.heading)}
              className={cn(
                'group relative rounded-md px-3 py-2 text-sm font-medium',
                'hover:bg-[var(--btn-subtle-hover)]',
              )}
            >
              {section.heading}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-3 -bottom-px h-0.5 origin-left scale-x-0 bg-[var(--surface-link)]',
                  'transition-transform duration-200 group-hover:scale-x-100',
                  isOpen && 'scale-x-100',
                )}
              />
            </button>

            <div
              id={panelId}
              hidden={!isOpen}
              data-surface="paper"
              className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-[var(--surface-line)] p-2 shadow-lg"
            >
              <Link
                href={section.href}
                className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-[var(--btn-subtle-hover)]"
                onClick={() => setOpenHeading(null)}
              >
                {ui.allInSection(section.heading)}
              </Link>
              <ul className="mt-1 border-t border-[var(--surface-line)] pt-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-sm text-[var(--surface-muted)] hover:bg-[var(--btn-subtle-hover)] hover:text-[var(--surface-fg)]"
                      onClick={() => setOpenHeading(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
