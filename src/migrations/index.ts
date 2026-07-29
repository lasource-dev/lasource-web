import * as initialSchema from './20260729_200000_initial_schema'

export const migrations = [
  {
    down: initialSchema.down,
    name: '20260729_200000_initial_schema',
    up: initialSchema.up,
  },
]
