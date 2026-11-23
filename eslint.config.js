import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Zorgt dat JSX-componenten als "gebruikt" tellen
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      // Waarschuwt voor ongebruikte imports, variabelen en functies
      'no-unused-vars': 'warn',
    },
  },
];
