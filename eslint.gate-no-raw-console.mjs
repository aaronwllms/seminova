import eslintConfig from './eslint.config.mjs'
import { namedGate } from './eslint.named-gate.mjs'

export default namedGate(eslintConfig, 'no-console')
