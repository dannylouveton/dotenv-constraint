import type { Config } from '@jest/types'
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/*.test.js']
}
export default config
