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
      // Underscore marks a deliberately discarded binding (e.g. stripping a key
      // off a rest spread). Everything else unused is an error.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
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

  // So are the tests. Unit-testing the transform that maps a $0.00 product to
  // quote-only means reaching past the barrel on purpose; exporting internals
  // from the barrel just to satisfy the linter would be the worse trade.
  {
    files: ['tests/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  prettier,
])

export default eslintConfig
