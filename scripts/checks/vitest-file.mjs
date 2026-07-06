#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const files = process.argv.slice(2).filter((arg) => arg !== '--')

if (files.length === 0) {
  console.error('Usage: pnpm test:file -- <path>')
  process.exit(1)
}

const result = spawnSync('vitest', ['run', ...files], { stdio: 'inherit' })
process.exit(result.status ?? 1)
