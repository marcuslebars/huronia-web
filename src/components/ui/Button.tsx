import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors duration-150 select-none ' +
  'disabled:pointer-events-none disabled:opacity-45 aria-disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-bg-hover)]',
  secondary:
    'border border-[var(--surface-line)] text-[var(--surface-fg)] hover:bg-[var(--btn-subtle-hover)]',
  ghost: 'text-[var(--surface-fg)] hover:bg-[var(--btn-subtle-hover)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-13 px-7 text-lg',
}

type SharedProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretches to the container width — used in the mobile drawer. */
  block?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = SharedProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof SharedProps> & { href?: never }

type ButtonAsLink = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof SharedProps> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Renders a <button> or, when `href` is present, a Next <Link>.
 * Colours come from the surrounding [data-surface], never from props.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', block, className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], block && 'w-full', className)

  if (rest.href !== undefined) {
    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    )
  }

  const { href: _href, ...buttonProps } = rest
  return (
    <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes}>
      {children}
    </button>
  )
}
