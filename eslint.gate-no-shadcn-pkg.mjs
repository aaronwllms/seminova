import eslintConfig from './eslint.config.mjs'
import { namedGate } from './eslint.named-gate.mjs'

export default namedGate(eslintConfig, 'no-restricted-imports', {
  configName: 'seminova/no-shadcn-pkg',
})
