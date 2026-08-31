'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * Drives a native <dialog> in modal mode.
 *
 * showModal() supplies the focus trap, the inert background and Escape-to-close
 * from the platform. What the platform does not reliably guarantee across
 * browsers is returning focus to whatever opened the dialog, so that is captured
 * on open and restored on close.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      const active = document.activeElement
      triggerRef.current = active instanceof HTMLElement ? active : null
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  /** Fires for every close path: Escape, form method="dialog", or dialog.close(). */
  const handleClose = useCallback(() => {
    document.documentElement.style.overflow = ''
    onClose()
    const trigger = triggerRef.current
    triggerRef.current = null
    // Restore after the dialog has left the top layer.
    requestAnimationFrame(() => trigger?.focus())
  }, [onClose])

  /** Clicking the ::backdrop reports the dialog itself as the event target. */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) event.currentTarget.close()
    },
    [],
  )

  return { dialogRef, handleClose, handleBackdropClick }
}
