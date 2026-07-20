import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { loadPublishedTechnology } from '../../lib/technology-public'
import type { Technology } from '../../../payload-types'

const runIntegration = process.env.RUN_POSTGRES_INTEGRATION === 'true'

describe.skipIf(!runIntegration)('Technology PostgreSQL integration', () => {
  let payload: Payload
  const createdIDs: string[] = []

  const createTechnology = async (
    suffix: string,
    overrides: Partial<Technology> = {},
  ) => {
    const document = await payload.create({
      collection: 'technologies',
      data: {
        canonical_name: `Technology ${suffix}`,
        category: 'SDK',
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
  }, 60_000)

  afterAll(async () => {
    for (const id of createdIDs.reverse()) {
      await payload.delete({ collection: 'technologies', id, overrideAccess: true })
    }
    await payload.db.destroy?.()
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
})
