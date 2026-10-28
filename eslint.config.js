import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import a11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vite-cache/**',
      'playwright-report/**',
      'test-results/**',
      '.sites/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': hooks, 'react-refresh': refresh, 'jsx-a11y': a11y },
    rules: {
      ...hooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'error',
      'react/no-danger': 'error',
      'react/jsx-no-target-blank': 'error',
      // Named scroll regions must be focusable so keyboard users can scroll overflow.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message: 'Render teks melalui JSX untuk mencegah injeksi HTML.',
        },
        {
          selector:
            'ClassDeclaration[superClass.name="Component"], ClassDeclaration[superClass.property.name="Component"]',
          message: 'Gunakan function component dan Hooks.',
        },
      ],
    },
  },
  prettier,
);
