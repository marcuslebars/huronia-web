'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useModalDialog } from '@/components/ui/useModalDialog'

export type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useModalDialog(open, onClose)
  const titleId = 'dialog-title'

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      data-surface="paper"
      className={cn(
        'm-auto w-[calc(100vw-2rem)] max-w-lg rounded-lg p-0 shadow-xl',
        'backdrop:bg-ink/60',
        className,
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-heading text-xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-m-2 rounded-md p-2 text-[var(--surface-muted)] hover:bg-[var(--btn-subtle-hover)]"
          >
            <span aria-hidden="true" className="block text-xl leading-none">
              &times;
            </span>
            <span className="sr-only">Close dialog</span>
          </button>
        </div>
        <div className="mt-4 text-[var(--surface-muted)]">{children}</div>
      </div>
    </dialog>
  )
}
