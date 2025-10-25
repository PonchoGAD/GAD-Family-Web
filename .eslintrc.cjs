// .eslintrc.cjs
const path = require('path');

module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')], // абсолютный путь
    tsconfigRootDir: __dirname,                          // абсолютный корень для parser
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    next: { rootDir: [__dirname] },
  },
  ignorePatterns: [
    '.next/**',
    'node_modules/**',
    '.vercel/**',
    'dist/**',
    // если у тебя есть build-артефакты в других папках — добавь сюда
  ],
  rules: {
    // Оставляем строгий линт, но без блокирующих флажков на уже починенном коде
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // не обязательные, но часто удобные:
    '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
  },
};
