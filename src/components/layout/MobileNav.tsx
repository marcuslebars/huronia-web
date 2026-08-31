'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { telHref } from '@/content/business'
import { ui } from '@/content/ui'
import type { NavLink, NavSection } from '@/types/content'

export type MobileNavProps = {
  sections: readonly NavSection[]
  primary: readonly NavLink[]
}

export function MobileNav({ sections, primary }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="-m-2 rounded-md p-2 lg:hidden"
      >
        <span aria-hidden="true" className="block text-xl leading-none">
          &#9776;
        </span>
        <span className="sr-only">{ui.openMenu}</span>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={ui.menuTitle}
        side="right"
      >
        <nav aria-label="Mobile">
          {sections.map((section) => (
            <div key={section.heading} className="mb-5">
              <Link
                href={section.href}
                onClick={() => setOpen(false)}
                className="font-heading block py-1 text-sm font-semibold tracking-wide uppercase"
              >
                {section.heading}
              </Link>
              <ul className="mt-1 border-l border-[var(--surface-line)] pl-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-1.5 text-[var(--surface-muted)] hover:text-[var(--surface-fg)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <ul className="mb-6 border-t border-[var(--surface-line)] pt-4">
            {primary.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1.5 font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2">
          <Button href="/quote" block onClick={() => setOpen(false)}>
            {ui.quoteCta}
          </Button>
          <Button href={telHref} variant="secondary" block>
            {ui.callCta}
          </Button>
        </div>
      </Drawer>
    </>
  )
}
