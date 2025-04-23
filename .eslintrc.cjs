module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  globals: {
    Promise: 'readonly',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'node_modules/**',
    '.nuxt/**',
    'dist/**',
    '.output/**',
    '*.vue', // Игнорируем Vue файлы, пока не настроим плагин
  ],
}
