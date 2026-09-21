import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Match repository-relative imports at any depth without restricting unrelated packages.
const sourcePrefix = '^(?:(?:\\.{1,2}/)+(?:src/)?|src/)'
const canonicalFixtures = {
  regex: `${sourcePrefix}data/(?:profile|siteContent|projects|technologies|capabilities|experiences)(?:\\.[cm]?[jt]sx?)?$`,
  message: 'Consume canonical content through usePortfolioContent / the application content boundary, not local fixtures.',
}
const contentInfrastructure = {
  regex: `${sourcePrefix}content(?:/|$)`,
  message: 'UI and provider modules must consume the loaded snapshot, not content gateways or infrastructure.',
}
const applicationLayer = {
  regex: `${sourcePrefix}application(?:/|$)`,
  message: 'Feature/UI code must consume usePortfolioContent, not the application loader.',
}
const fixtureData = {
  regex: `${sourcePrefix}data(?:/|$)`,
  message: 'This layer must not depend on local fixture or presentation data; use domain types and the gateway port.',
}
const adapters = {
  // Also matches ./adapters and ../adapters from inside src/content.
  regex: `${sourcePrefix}(?:content/)?adapters(?:/|$)`,
  message: 'Adapter selection belongs at the composition root, not in this layer.',
}
const reactFramework = {
  regex: '^react(?:/|$)',
  message: 'This layer must remain framework independent and must not import React.',
}
const domainOuterLayers = {
  regex: `${sourcePrefix}(?:app|application|content|data|components|features|hooks|utils)(?:/|$)`,
  message: 'Domain modules must remain framework/infrastructure independent; do not import outer application layers or fixture data.',
}
const portUiLayers = {
  regex: `${sourcePrefix}(?:app|application|components|features)(?:/|$)`,
  message: 'The gateway port is domain-facing and must not depend on application or UI modules.',
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/components/**/*.{js,jsx,ts,tsx}', 'src/features/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [canonicalFixtures, contentInfrastructure, applicationLayer],
      }],
    },
  },
  {
    files: ['src/app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [canonicalFixtures, contentInfrastructure],
      }],
    },
  },
  {
    files: ['src/application/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [fixtureData, adapters, reactFramework],
      }],
    },
  },
  {
    files: ['src/domain/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [reactFramework, domainOuterLayers],
      }],
    },
  },
  {
    files: ['src/content/portfolio-content-gateway.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [reactFramework, fixtureData, adapters, portUiLayers],
      }],
    },
  },
  {
    files: ['src/content/testing/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [adapters, fixtureData],
      }],
    },
  },
  {
    files: ['src/hooks/**/*.{js,jsx,ts,tsx}', 'src/utils/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [adapters],
      }],
    },
  },
])
