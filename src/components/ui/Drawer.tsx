'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useModalDialog } from '@/components/ui/useModalDialog'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  /** Accessible name for the drawer. Rendered visibly unless `hideTitle`. */
  title: string
  hideTitle?: boolean
  side?: 'left' | 'right'
  children: ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  hideTitle,
  side = 'right',
  children,
  className,
}: DrawerProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useModalDialog(open, onClose)
  const titleId = 'drawer-title'

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      data-surface="paper"
      className={cn(
        'h-dvh max-h-none w-[min(22rem,calc(100vw-3rem))] max-w-none p-0 shadow-2xl',
        'backdrop:bg-ink/60',
        side === 'right' ? 'mr-0 ml-auto' : 'mr-auto ml-0',
        'my-0',
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-line)] px-5 py-4">
          <h2
            id={titleId}
            className={cn('font-heading text-lg font-semibold', hideTitle && 'sr-only')}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-m-2 ml-auto rounded-md p-2 text-[var(--surface-muted)] hover:bg-[var(--btn-subtle-hover)]"
          >
            <span aria-hidden="true" className="block text-xl leading-none">
              &times;
            </span>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </dialog>
  )
}
