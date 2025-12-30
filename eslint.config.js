import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off'
    }
  },
  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/legacy/**',
      'src/libraries/**',
      'src/css/**',
      'public/**',
      'scripts/**'
    ]
  }
]
