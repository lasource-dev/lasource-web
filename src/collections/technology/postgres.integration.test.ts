import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { loadPublishedTechnology } from '../../lib/technology-public'
import { CATEGORY_MIGRATION_UP_SQL } from '../../migrations/20260720_203000_category_resource'
import type { Category, Technology } from '../../../payload-types'

const runIntegration = process.env.RUN_POSTGRES_INTEGRATION === 'true'

describe.skipIf(!runIntegration)('Technology PostgreSQL integration', () => {
  let payload: Payload
  let primaryCategoryID: string
  const createdCategoryIDs: string[] = []
  const createdIDs: string[] = []

  const createCategory = async (
    suffix: string,
    overrides: Partial<Category> = {},
  ) => {
    const document = await payload.create({
      collection: 'categories',
      data: {
        archived: false,
        canonical_name: `Category ${suffix}`,
        editorial_status: 'draft',
        short_description: `Description ${suffix}`,
        ...overrides,
      },
      draft: true,
      overrideAccess: true,
    })
    createdCategoryIDs.push(document.id)

    if (overrides.editorial_status === 'published') {
      return payload.update({
        collection: 'categories',
        id: document.id,
        data: { editorial_status: 'published' },
        draft: false,
        overrideAccess: true,
      })
    }

    return document
  }

  const createTechnology = async (
    suffix: string,
    overrides: Partial<Technology> = {},
  ) => {
    const document = await payload.create({
      collection: 'technologies',
      data: {
        canonical_name: `Technology ${suffix}`,
        category: primaryCategoryID,
        editorial_status: 'draft',
        freshness_status: 'unknown',
        short_description: `Description ${suffix}`,
        ...overrides,
      },
      draft: true,
      overrideAccess: true,
    })
    createdIDs.push(document.id)

    if (overrides.editorial_status === 'published') {
      return payload.update({
        collection: 'technologies',
        id: document.id,
        data: { editorial_status: 'published' },
        draft: false,
        overrideAccess: true,
      })
    }

    return document
  }

  const findPublicBySlug = async (slug: string) => {
    const result = await payload.find({
      collection: 'technologies',
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: slug } },
    })
    return result.docs
  }

  beforeAll(async () => {
    const [{ default: config }, { getPayload }] = await Promise.all([
      import('../../payload.config'),
      import('payload'),
    ])
    payload = await getPayload({ config })
    const primaryCategory = await createCategory('SDK', {
      canonical_name: 'SDK',
      editorial_status: 'published',
    })
    primaryCategoryID = primaryCategory.id
  }, 60_000)

  afterAll(async () => {
    for (const id of createdIDs.reverse()) {
      await payload.delete({ collection: 'technologies', id, overrideAccess: true })
    }
    for (const id of createdCategoryIDs.reverse()) {
      await payload.delete({ collection: 'categories', id, overrideAccess: true })
    }
    await payload.db.destroy?.()
  })

  it('garantit les invariants Category via Payload et PostgreSQL', async () => {
    const created = await createCategory('Framework', {
      aliases: [{ alias: ' Framework ' }, { alias: 'framework' }, { alias: 'Cadriciel' }],
      canonical_name: 'Framework applicatif',
      slug: ' Framework.App ',
    })
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.slug).toBe('framework-app')
    expect(created.aliases?.map(({ alias }) => alias)).toEqual(['Framework', 'Cadriciel'])

    const renamed = await payload.update({
      collection: 'categories',
      id: created.id,
      data: { canonical_name: 'Framework renommé' },
      overrideAccess: true,
    })
    expect(renamed.id).toBe(created.id)
    expect(renamed.slug).toBe(created.slug)

    await expect(
      payload.update({
        collection: 'categories',
        id: created.id,
        data: { id: '11111111-1111-4111-8111-111111111111' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Category id is immutable')
    await expect(
      payload.update({
        collection: 'categories',
        id: created.id,
        data: { slug: 'framework-change' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Category slug is immutable')
    await expect(createCategory('Duplicate', { slug: 'framework-app' })).rejects.toThrow()
  })

  it('génère un UUID immuable et un slug stable', async () => {
    const created = await createTechnology('Éditeur IA')
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.slug).toBe('technology-editeur-ia')

    await expect(
      payload.update({
        collection: 'technologies',
        id: created.id,
        data: { id: '11111111-1111-4111-8111-111111111111' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Technology id is immutable')

    const renamed = await payload.update({
      collection: 'technologies',
      id: created.id,
      data: { canonical_name: 'Nom entièrement différent' },
      overrideAccess: true,
    })
    expect(renamed.id).toBe(created.id)
    expect(renamed.slug).toBe(created.slug)

    await expect(
      payload.update({
        collection: 'technologies',
        id: created.id,
        data: { slug: 'slug-modifie' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Technology slug is immutable')
  })

  it('normalise les alias et garantit l’unicité du slug en base', async () => {
    const created = await createTechnology('Aliases', {
      aliases: [
        { alias: ' LangChain ' },
        { alias: 'langchain' },
        { alias: 'LANGCHAIN' },
        { alias: ' LangChain   JS ' },
      ],
      canonical_name: 'LangChain Core',
      slug: '  LangChain.Core  ',
    })
    expect(created.slug).toBe('langchain-core')
    expect(created.aliases?.map(({ alias }) => alias)).toEqual(['LangChain', 'LangChain JS'])

    await expect(createTechnology('Duplicate', { slug: 'langchain-core' })).rejects.toThrow()
  })

  it('n’expose que les contenus publiés et actifs', async () => {
    const draft = await createTechnology('Visibility draft')
    const published = await createTechnology('Visibility published', {
      editorial_status: 'published',
    })
    const archived = await createTechnology('Visibility archived', {
      editorial_status: 'archived',
    })

    expect(await loadPublishedTechnology(draft.slug, findPublicBySlug)).toBeNull()
    expect(await loadPublishedTechnology(archived.slug, findPublicBySlug)).toBeNull()
    expect(await loadPublishedTechnology('technology-inconnue', findPublicBySlug)).toBeNull()
    expect((await loadPublishedTechnology(published.slug, findPublicBySlug))?.id).toBe(published.id)

    await expect(
      payload.update({
        collection: 'categories',
        id: primaryCategoryID,
        data: { archived: true },
        overrideAccess: true,
      }),
    ).rejects.toThrow('A Category used by a published Technology cannot be archived')
  })

  it('refuse de publier une technologie avec une catégorie non publiée', async () => {
    const draftCategory = await createCategory('Draft')
    await expect(
      createTechnology('Invalid category', {
        category: draftCategory.id,
        editorial_status: 'published',
      }),
    ).rejects.toThrow('A published Technology requires a published, active Category')
  })

  it('matérialise exactement les index utiles dans PostgreSQL', async () => {
    const { rows } = await payload.db.pool.query<{ indexdef: string; indexname: string }>(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'technologies'
    `)
    const definitions = rows.map(({ indexdef }) => indexdef.toLowerCase().replaceAll('"', ''))
    const hasIndexFor = (column: string) => definitions.some((definition) =>
      definition.includes(`(${column})`),
    )

    expect(definitions.some((definition) =>
      definition.includes('unique') && definition.includes('(id)'),
    )).toBe(true)
    expect(definitions.some((definition) =>
      definition.includes('unique') && definition.includes('(slug)'),
    )).toBe(true)
    expect(hasIndexFor('canonical_name')).toBe(true)
    expect(hasIndexFor('editorial_status')).toBe(true)
    expect(hasIndexFor('freshness_status')).toBe(true)

    const signatures = definitions.map((definition) => {
      const columns = definition.match(/\(([^)]+)\)/)?.[1]?.replaceAll(' ', '')
      return `${definition.includes('create unique index')}:${columns}`
    })
    expect(new Set(signatures).size).toBe(signatures.length)
  })

  it('exécute deux fois la migration Category sans perte ni doublon', async () => {
    await payload.db.pool.query(CATEGORY_MIGRATION_UP_SQL)
    await payload.db.pool.query(CATEGORY_MIGRATION_UP_SQL)

    const { rows: auditColumns } = await payload.db.pool.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'technologies' AND column_name = 'legacy_category'
    `)
    const { rows: duplicateCategories } = await payload.db.pool.query<{ count: string }>(`
      SELECT count(*)::text AS count
      FROM (
        SELECT lower(canonical_name)
        FROM categories
        GROUP BY lower(canonical_name)
        HAVING count(*) > 1
      ) duplicates
    `)

    expect(auditColumns).toHaveLength(1)
    expect(duplicateCategories[0]?.count).toBe('0')
  })
})
