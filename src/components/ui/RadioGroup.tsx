import { cn } from '@/lib/cn'

export type RadioOption = { readonly value: string; readonly label: string }

export type RadioGroupProps = {
  legend: string
  name: string
  options: readonly RadioOption[]
  value?: string
  description?: string
  error?: string
  onChange?: (value: string) => void
  /** Stack as cards rather than a plain list. Used for step 1's long list. */
  variant?: 'list' | 'cards'
  className?: string
}

/**
 * A real <fieldset>/<legend> radio group. Arrow-key navigation, the group
 * label and the checked state all come from the platform; the only thing
 * added is the error wiring.
 */
export function RadioGroup({
  legend,
  name,
  options,
  value,
  description,
  error,
  onChange,
  variant = 'list',
  className,
}: RadioGroupProps) {
  const describedBy =
    [description ? `${name}-description` : null, error ? `${name}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <fieldset
      // aria-invalid is not allowed on role=radio, but it is on the group.
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn('min-w-0', className)}
    >
      <legend className="font-heading text-lg font-medium">{legend}</legend>

      {description ? (
        <p
          id={`${name}-description`}
          className="max-w-measure mt-2 text-sm text-[var(--surface-muted)]"
        >
          {description}
        </p>
      ) : null}

      <div
        className={cn(
          'mt-4',
          variant === 'cards' ? 'grid gap-2 sm:grid-cols-2' : 'flex flex-col gap-2',
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors',
              'border-[var(--surface-line)] hover:bg-[var(--btn-subtle-hover)]',
              'has-checked:border-[var(--color-accent)] has-checked:bg-[var(--btn-subtle-hover)]',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              // Controlled only when a value is supplied. Passing `checked`
              // without `onChange` makes React warn and freezes the input.
              {...(value === undefined
                ? {}
                : {
                    checked: value === option.value,
                    onChange: () => onChange?.(option.value),
                  })}
              className="size-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-2 text-sm font-medium text-[var(--color-accent-dark)]"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
