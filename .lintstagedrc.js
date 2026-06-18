const path = require('path')

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`

const prettierWrite = 'prettier --ignore-path .prettierignore --write'

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, prettierWrite],
  '*.{md,json,yml,yaml,css}': prettierWrite,
}
