// eslint.config.cjs
const path = require('path');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

/** Файлы-конфиги, где require допустим */
const CONFIG_FILES = [
  'eslint.config.cjs',
  'next.config.mjs',
  'postcss.config.cjs',
  'tailwind.config.js',
];

module.exports = [
  // 0) Игноры — чтобы не трогать артефакты и hardhat/tools
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.vercel/**',
      'dist/**',
      'contracts/**',
      'tools/**',
      'stubs/**',
    ],
  },

  // 1) Базовые пресеты next + ts
  ...compat.extends('next/core-web-vitals', 'plugin:@typescript-eslint/recommended'),

  // 2) Для файлов-конфигов — разрешаем require
  {
    files: CONFIG_FILES,
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
      'global-require': 'off',
    },
  },

  // 3) TS-правила только для исходников приложения
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.json')],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
    },
  },

  // 4) next-env.d.ts — отключаем спорную проверку triple-slash
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
