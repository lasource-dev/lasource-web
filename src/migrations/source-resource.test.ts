import { describe, expect, it } from 'vitest'

import {
  SOURCE_MIGRATION_DOWN_SQL,
  SOURCE_MIGRATION_UP_SQL,
} from './20260729_160000_source_resource'

describe('Source SQL migration', () => {
  it('est réexécutable sans dupliquer les sources ni les relations', () => {
    expect(SOURCE_MIGRATION_UP_SQL).toContain('IF NOT EXISTS')
    expect(SOURCE_MIGRATION_UP_SQL).toContain('ON CONFLICT ("url") DO NOTHING')
    expect(SOURCE_MIGRATION_UP_SQL).toContain('WHERE NOT EXISTS')
  })

  it('refuse une migration avec une référence impossible à tracer', () => {
    expect(SOURCE_MIGRATION_UP_SQL).toContain(
      'Source migration refused: a legacy reference has no URL',
    )
  })

  it('conserve les références historiques comme audit et les restaure au rollback', () => {
    expect(SOURCE_MIGRATION_UP_SQL).toContain('technologies_legacy_source_ids')
    expect(SOURCE_MIGRATION_UP_SQL).not.toContain(
      'DROP TABLE IF EXISTS "technologies_legacy_source_ids"',
    )
    expect(SOURCE_MIGRATION_DOWN_SQL).toContain(
      'ALTER TABLE "technologies_legacy_source_ids" RENAME TO "technologies_source_ids"',
    )
  })
})
