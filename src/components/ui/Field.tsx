import { cn } from '@/lib/cn'

type Option = { readonly value: string; readonly label: string }

type BaseProps = {
  label: string
  name: string
  id?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Controlled value. Pass with onChange; use defaultValue for uncontrolled. */
  value?: string
  defaultValue?: string
  /** Receives the value directly — callers never unwrap the event themselves. */
  onChange?: (value: string) => void
  placeholder?: string
  autoComplete?: string
  className?: string
}

/**
 * Control props are an explicit, curated list rather than a spread of every
 * HTML attribute. The quote form (§8) needs exactly these, and closing the set
 * keeps the accessibility wiring below impossible to bypass.
 */
type InputProps = BaseProps & {
  as?: 'input'
  type?: 'text' | 'email' | 'tel' | 'number' | 'url'
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  pattern?: string
}

type TextareaProps = BaseProps & { as: 'textarea'; rows?: number }

type SelectProps = BaseProps & { as: 'select'; options: readonly Option[] }

export type FieldProps = InputProps | TextareaProps | SelectProps

const control =
  'w-full rounded-md border bg-[var(--color-paper)] px-3 py-2 text-base text-ink ' +
  'border-[var(--color-line)] placeholder:text-muted ' +
  'aria-[invalid=true]:border-[var(--color-accent-dark)] disabled:opacity-45'

/**
 * Label, control, description and error in one place, so aria-describedby and
 * aria-invalid cannot drift apart. Errors are announced via role="alert";
 * Phase 5 additionally moves focus to an error summary on submit.
 */
export function Field(props: FieldProps) {
  const { label, name, id, description, error, required, disabled, className } = props
  const fieldId = id ?? `field-${name}`
  const describedBy =
    [description ? `${fieldId}-description` : null, error ? `${fieldId}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined

  const { value, defaultValue, onChange } = props

  const shared = {
    id: fieldId,
    name,
    required,
    disabled,
    placeholder: props.placeholder,
    autoComplete: props.autoComplete,
    className: control,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    // Controlled when `value` is supplied, uncontrolled otherwise. Sending both
    // would make React warn and the control would stop responding to typing.
    ...(value === undefined ? { defaultValue } : { value }),
    ...(onChange === undefined
      ? {}
      : {
          onChange: (
            event: React.ChangeEvent<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
          ) => onChange(event.target.value),
        }),
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--surface-fg)]">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-[var(--color-accent-dark)]">
              {' '}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {description ? (
        <p id={`${fieldId}-description`} className="text-sm text-[var(--surface-muted)]">
          {description}
        </p>
      ) : null}

      {props.as === 'textarea' ? (
        <textarea {...shared} rows={props.rows ?? 4} />
      ) : props.as === 'select' ? (
        <select {...shared}>
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...shared}
          type={props.type ?? 'text'}
          inputMode={props.inputMode}
          pattern={props.pattern}
        />
      )}

      {error ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm font-medium text-[var(--color-accent-dark)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
