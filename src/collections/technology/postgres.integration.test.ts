import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { loadPublishedTechnology } from '../../lib/technology-public'
import type { Category, Relation, Source, Technology } from '../../../payload-types'

const runIntegration = process.env.RUN_POSTGRES_INTEGRATION === 'true'

describe.skipIf(!runIntegration)('Technology PostgreSQL integration', () => {
  let payload: Payload
  let primaryCategoryID: string
  const createdCategoryIDs: string[] = []
  const createdSourceIDs: string[] = []
  const createdRelationIDs: string[] = []
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

  const createSource = async (suffix: string, overrides: Partial<Source> = {}) => {
    const document = await payload.create({
      collection: 'sources',
      data: {
        archived: false,
        confidence_score: 80,
        editorial_status: 'draft',
        title: `Source ${suffix}`,
        type: 'documentation',
        url: `https://example.com/${suffix}`,
        ...overrides,
      },
      draft: true,
      overrideAccess: true,
    })
    createdSourceIDs.push(document.id)

    if (overrides.editorial_status === 'published') {
      return payload.update({
        collection: 'sources',
        id: document.id,
        data: { editorial_status: 'published' },
        draft: false,
        overrideAccess: true,
      })
    }

    return document
  }

  const createRelation = async (
    suffix: string,
    sourceID: string,
    targetID: string,
    overrides: Partial<Relation> = {},
  ) => {
    const document = await payload.create({
      collection: 'relations',
      data: {
        archived: false,
        editorial_status: 'draft',
        relation_type: 'uses',
        source: sourceID,
        target: targetID,
        ...overrides,
      },
      draft: true,
      overrideAccess: true,
    })
    createdRelationIDs.push(document.id)

    if (overrides.editorial_status === 'published') {
      return payload.update({
        collection: 'relations',
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
    for (const id of createdRelationIDs.reverse()) {
      await payload.delete({ collection: 'relations', id, overrideAccess: true })
    }
    for (const id of createdIDs.reverse()) {
      await payload.delete({ collection: 'technologies', id, overrideAccess: true })
    }
    for (const id of createdSourceIDs.reverse()) {
      await payload.delete({ collection: 'sources', id, overrideAccess: true })
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

  it('garantit les invariants Source via Payload et PostgreSQL', async () => {
    const created = await createSource('canonical?utm_source=test&page=2', {
      url: 'HTTPS://EXAMPLE.com/documentation/?utm_source=test&page=2#intro',
    })
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.url).toBe('https://example.com/documentation?page=2')

    await expect(
      payload.update({
        collection: 'sources',
        id: created.id,
        data: { id: '11111111-1111-4111-8111-111111111111' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Source id is immutable')
    await expect(
      createSource('duplicate', { url: 'https://example.com/documentation?page=2' }),
    ).rejects.toThrow()
    await expect(
      createSource('unverified', { editorial_status: 'published' }),
    ).rejects.toThrow('verified_at is required')
  })

  it('relie uniquement des sources actives aux technologies publiées', async () => {
    const draftSource = await createSource('draft-source')
    await expect(
      createTechnology('Invalid source', {
        editorial_status: 'published',
        source_ids: [draftSource.id],
      }),
    ).rejects.toThrow('A published Technology can only reference published, active Sources')

    const publishedSource = await createSource('published-source', {
      editorial_status: 'published',
      verified_at: '2026-07-20T12:00:00.000Z',
    })
    const technology = await createTechnology('Cited', {
      editorial_status: 'published',
      source_ids: [publishedSource.id],
    })
    expect(technology.source_ids).toHaveLength(1)

    await expect(
      payload.update({
        collection: 'sources',
        id: publishedSource.id,
        data: { archived: true },
        overrideAccess: true,
      }),
    ).rejects.toThrow('A Source used by a published Technology cannot be archived')
  })

  it('canonise les relations et bloque les doublons symétriques', async () => {
    const first = await createTechnology('Relation symmetric A')
    const second = await createTechnology('Relation symmetric B')
    const relation = await createRelation('symmetric', second.id, first.id, {
      relation_type: 'compatible_with',
    })

    expect(relation.canonical_key).toBe(
      `compatible_with:${[first.id, second.id].sort().join(':')}`,
    )
    await expect(
      createRelation('symmetric duplicate', first.id, second.id, {
        relation_type: 'compatible_with',
      }),
    ).rejects.toThrow()
  })

  it('conserve le sens des relations dirigées et refuse les auto-relations', async () => {
    const first = await createTechnology('Relation directed A')
    const second = await createTechnology('Relation directed B')
    const forward = await createRelation('forward', first.id, second.id)
    const reverse = await createRelation('reverse', second.id, first.id)

    expect(forward.canonical_key).not.toBe(reverse.canonical_key)
    await expect(createRelation('self', first.id, first.id)).rejects.toThrow(
      'cannot link a Technology to itself',
    )
  })

  it('publie seulement une relation vérifiée entre ressources publiques et sourcées', async () => {
    const first = await createTechnology('Relation public A', {
      editorial_status: 'published',
    })
    const second = await createTechnology('Relation public B', {
      editorial_status: 'published',
    })
    const evidence = await createSource('relation-evidence', {
      editorial_status: 'published',
      verified_at: '2026-07-20T12:00:00.000Z',
    })

    const published = await createRelation('published', first.id, second.id, {
      editorial_status: 'published',
      source_ids: [evidence.id],
      verified_at: '2026-07-20T12:00:00.000Z',
    })
    expect(published._status).toBe('published')

    await expect(
      payload.update({
        collection: 'technologies',
        id: first.id,
        data: { editorial_status: 'archived' },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Technology used by a published Relation')
    await expect(
      payload.update({
        collection: 'sources',
        id: evidence.id,
        data: { archived: true },
        overrideAccess: true,
      }),
    ).rejects.toThrow('Source used by a published Relation')
    await expect(
      payload.delete({
        collection: 'technologies',
        id: first.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow('Technology used by a Relation cannot be deleted')
    await expect(
      payload.delete({
        collection: 'sources',
        id: evidence.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow('Source used by a Relation cannot be deleted')
  })

  it('refuse de publier une relation sans preuve ou avec une extrémité non publique', async () => {
    const draft = await createTechnology('Relation draft endpoint')
    const published = await createTechnology('Relation published endpoint', {
      editorial_status: 'published',
    })
    const evidence = await createSource('relation-valid-evidence', {
      editorial_status: 'published',
      verified_at: '2026-07-20T12:00:00.000Z',
    })

    await expect(
      createRelation('draft endpoint', draft.id, published.id, {
        editorial_status: 'published',
        source_ids: [evidence.id],
        verified_at: '2026-07-20T12:00:00.000Z',
      }),
    ).rejects.toThrow('published source Technology')
    await expect(
      createRelation('missing evidence', published.id, draft.id, {
        editorial_status: 'published',
        verified_at: '2026-07-20T12:00:00.000Z',
      }),
    ).rejects.toThrow()
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

  it('dispose du schéma initial complet sur PostgreSQL', async () => {
    const { rows } = await payload.db.pool.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'categories', 'sources', 'technologies', 'relations')
      ORDER BY table_name
    `)

    expect(rows.map(({ table_name }) => table_name)).toEqual([
      'categories',
      'relations',
      'sources',
      'technologies',
      'users',
    ])
  })
})
