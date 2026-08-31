import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
  ]),

  ...nextVitals,
  ...nextTs,

  {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      // PROJECT_BRIEF.md §2 / CLAUDE.md: `any` is banned, not discouraged.
      // Phase 7's "zero `any`" gate is enforced here — `tsc` alone permits explicit any.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // CLAUDE.md hard rule: nothing outside lib/shopify/ imports Shopify types.
      // The barrel is the only public surface, so leaving Shopify means one directory changes.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/shopify/*', '**/lib/shopify/*'],
              message:
                "Import from '@/lib/shopify' only. Its internals are private — transform at the boundary (CLAUDE.md).",
            },
            {
              group: ['@shopify/*'],
              message:
                'Shopify SDKs belong in src/lib/shopify/ only. Transform into our own domain types at the boundary (CLAUDE.md).',
            },
          ],
        },
      ],
    },
  },

  // The boundary itself is allowed to know about Shopify.
  {
    files: ['src/lib/shopify/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  prettier,
])

export default eslintConfig
