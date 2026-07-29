import { describe, expect, it } from 'vitest'

import {
  INITIAL_SCHEMA_DOWN_SQL,
  INITIAL_SCHEMA_UP_SQL,
} from '../migrations/20260729_200000_initial_schema'
import { migrations } from '../migrations'

const requiredTables = [
  'users',
  'users_sessions',
  'categories',
  'sources',
  'technologies',
  'relations',
  'payload_migrations',
]

describe('initial PostgreSQL schema', () => {
  it('is the first and only pre-production baseline', () => {
    expect(migrations.map(({ name }) => name)).toEqual(['20260729_200000_initial_schema'])
  })

  it.each(requiredTables)('creates the %s table on an empty database', (table) => {
    expect(INITIAL_SCHEMA_UP_SQL).toContain(`CREATE TABLE "${table}"`)
  })

  it('creates the required unique business indexes', () => {
    expect(INITIAL_SCHEMA_UP_SQL).toContain('CREATE UNIQUE INDEX "categories_slug_idx"')
    expect(INITIAL_SCHEMA_UP_SQL).toContain('CREATE UNIQUE INDEX "sources_url_idx"')
    expect(INITIAL_SCHEMA_UP_SQL).toContain('CREATE UNIQUE INDEX "technologies_slug_idx"')
    expect(INITIAL_SCHEMA_UP_SQL).toContain(
      'CREATE UNIQUE INDEX "relations_canonical_key_idx"',
    )
    expect(INITIAL_SCHEMA_UP_SQL).toContain('CREATE UNIQUE INDEX "users_email_idx"')
  })

  it('provides a complete rollback for the baseline resources', () => {
    for (const table of requiredTables) {
      expect(INITIAL_SCHEMA_DOWN_SQL).toContain(`DROP TABLE "${table}" CASCADE`)
    }
  })
})
