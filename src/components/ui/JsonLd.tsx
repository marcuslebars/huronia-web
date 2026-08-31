import type { JsonLdObject } from '@/lib/schema'

export type JsonLdProps = {
  schema: JsonLdObject
}

/**
 * Renders a JSON-LD block. Builders live in lib/schema.ts; nothing constructs
 * structured data inline (§9).
 *
 * JSON.stringify cannot produce "</script>", but it can produce the substring
 * "</" inside a string value, which ends the script element early in an HTML
 * parser. Escaping the forward slash is the standard defence and stays valid
 * JSON.
 */
export function JsonLd({ schema }: JsonLdProps) {
  const json = JSON.stringify(schema).replaceAll('<', '\\u003c')

  return (
    <script
      type="application/ld+json"
      // The content is built from typed modules, never from user input.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
