import { describe, expect, it } from 'vitest'

import {
  RELATION_MIGRATION_DOWN_SQL,
  RELATION_MIGRATION_UP_SQL,
} from './20260729_183000_relation_resource'

describe('Relation SQL migration', () => {
  it('est réexécutable', () => {
    expect(RELATION_MIGRATION_UP_SQL).toContain('IF NOT EXISTS')
    expect(RELATION_MIGRATION_UP_SQL).toContain('duplicate_object')
  })

  it('matérialise l’unicité et les traversées dirigées', () => {
    expect(RELATION_MIGRATION_UP_SQL).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "relations_canonical_key_idx"',
    )
    expect(RELATION_MIGRATION_UP_SQL).toContain(
      '("source_id", "relation_type")',
    )
    expect(RELATION_MIGRATION_UP_SQL).toContain(
      '("target_id", "relation_type")',
    )
  })

  it('protège les Technologies et Sources référencées', () => {
    expect(RELATION_MIGRATION_UP_SQL).toContain('ON DELETE restrict')
    expect(RELATION_MIGRATION_UP_SQL).toContain(
      'FOREIGN KEY ("sources_id") REFERENCES "sources"("id")',
    )
  })

  it('retire entièrement la ressource au rollback', () => {
    expect(RELATION_MIGRATION_DOWN_SQL).toContain('DROP TABLE IF EXISTS "relations"')
    expect(RELATION_MIGRATION_DOWN_SQL).toContain(
      'DROP TYPE IF EXISTS "enum_relations_relation_type"',
    )
  })
})
