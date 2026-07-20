import { describe, expect, it } from 'vitest'

import {
  CATEGORY_MIGRATION_DOWN_SQL,
  CATEGORY_MIGRATION_UP_SQL,
} from './20260720_203000_category_resource'

describe('Category SQL migration', () => {
  it('est réexécutable pour les objets et les écritures métier', () => {
    expect(CATEGORY_MIGRATION_UP_SQL).toContain('IF NOT EXISTS')
    expect(CATEGORY_MIGRATION_UP_SQL).toContain('ON CONFLICT ("slug") DO NOTHING')
    expect(CATEGORY_MIGRATION_UP_SQL).toContain('technology."category_id" IS NULL')
  })

  it('refuse de supprimer le champ historique avant rattachement complet', () => {
    const guard = CATEGORY_MIGRATION_UP_SQL.indexOf('Category migration refused')
    const dropLegacy = CATEGORY_MIGRATION_UP_SQL.indexOf('DROP COLUMN IF EXISTS "legacy_category"')
    expect(guard).toBeGreaterThan(-1)
    expect(dropLegacy).toBeGreaterThan(guard)
  })

  it('restaure les valeurs textuelles lors du rollback', () => {
    expect(CATEGORY_MIGRATION_DOWN_SQL).toContain('SET "category" = category.canonical_name')
    expect(CATEGORY_MIGRATION_DOWN_SQL).toContain('SET "version_category" = category.canonical_name')
  })
})
