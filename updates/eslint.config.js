import { eslint } from 'config-aeryle'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...eslint.typescript, //
  ...eslint.prettier,

  // eslint-plugin-import
  ...eslint.esm,
  ...eslint.imports,

  // Ignore files
  eslint.ignores.base, // node_modules, .DS_Store
  ...eslint.ignores.packageManagers, // NPM, Pnpm, Yarn, Bun
  {
    ignores: ['dist/'],
  },
]
