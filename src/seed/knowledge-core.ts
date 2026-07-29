export const DEMO_VERIFIED_AT = '2026-07-29T00:00:00.000Z'

export type SeedCollection = 'categories' | 'sources' | 'technologies' | 'relations'

export type SeedDocument = {
  id: string
}

export type SeedData = Record<string, unknown>

export interface KnowledgeSeedStore {
  create(collection: SeedCollection, data: SeedData): Promise<SeedDocument>
  findOne(
    collection: SeedCollection,
    field: string,
    value: string,
  ): Promise<SeedDocument | null>
}

export type KnowledgeSeedResult = {
  created: Record<SeedCollection, number>
  reused: Record<SeedCollection, number>
}

type SeedDefinition = {
  collection: SeedCollection
  key: string
  value: string
  data: SeedData
}

const categoryDefinitions: SeedDefinition[] = [
  {
    collection: 'categories',
    key: 'slug',
    value: 'framework-web',
    data: {
      slug: 'framework-web',
      canonical_name: 'Framework web',
      aliases: [],
      short_description: 'Socle applicatif destiné à la création d’applications web.',
      editorial_status: 'published',
      archived: false,
      meta_title: 'Frameworks web',
      meta_description: 'Technologies utilisées pour construire des applications web.',
      _status: 'published',
    },
  },
  {
    collection: 'categories',
    key: 'slug',
    value: 'cms-headless',
    data: {
      slug: 'cms-headless',
      canonical_name: 'CMS headless',
      aliases: [{ alias: 'Headless CMS' }],
      short_description: 'Système de gestion de contenu exposant ses données aux interfaces clientes.',
      editorial_status: 'published',
      archived: false,
      meta_title: 'CMS headless',
      meta_description: 'Systèmes de gestion de contenu conçus pour des interfaces découplées.',
      _status: 'published',
    },
  },
  {
    collection: 'categories',
    key: 'slug',
    value: 'base-de-donnees-relationnelle',
    data: {
      slug: 'base-de-donnees-relationnelle',
      canonical_name: 'Base de données relationnelle',
      aliases: [{ alias: 'SGBDR' }],
      short_description: 'Système structurant les données sous forme de relations.',
      editorial_status: 'published',
      archived: false,
      meta_title: 'Bases de données relationnelles',
      meta_description: 'Technologies de stockage fondées sur le modèle relationnel.',
      _status: 'published',
    },
  },
]

const sourceDefinitions: SeedDefinition[] = [
  {
    collection: 'sources',
    key: 'url',
    value: 'https://nextjs.org/docs',
    data: {
      url: 'https://nextjs.org/docs',
      type: 'documentation',
      title: 'Documentation officielle Next.js',
      author: 'Vercel',
      confidence_score: 100,
      verified_at: DEMO_VERIFIED_AT,
      editorial_status: 'published',
      archived: false,
      _status: 'published',
    },
  },
  {
    collection: 'sources',
    key: 'url',
    value: 'https://payloadcms.com/docs',
    data: {
      url: 'https://payloadcms.com/docs',
      type: 'documentation',
      title: 'Documentation officielle Payload CMS',
      author: 'Payload',
      confidence_score: 100,
      verified_at: DEMO_VERIFIED_AT,
      editorial_status: 'published',
      archived: false,
      _status: 'published',
    },
  },
  {
    collection: 'sources',
    key: 'url',
    value: 'https://www.postgresql.org/docs',
    data: {
      url: 'https://www.postgresql.org/docs',
      type: 'documentation',
      title: 'Documentation officielle PostgreSQL',
      author: 'PostgreSQL Global Development Group',
      confidence_score: 100,
      verified_at: DEMO_VERIFIED_AT,
      editorial_status: 'published',
      archived: false,
      _status: 'published',
    },
  },
]

async function ensureDocument(
  store: KnowledgeSeedStore,
  definition: SeedDefinition,
  result: KnowledgeSeedResult,
): Promise<SeedDocument> {
  const existing = await store.findOne(
    definition.collection,
    definition.key,
    definition.value,
  )
  if (existing) {
    result.reused[definition.collection] += 1
    return existing
  }

  const created = await store.create(definition.collection, definition.data)
  result.created[definition.collection] += 1
  return created
}

function emptyCounts(): Record<SeedCollection, number> {
  return {
    categories: 0,
    sources: 0,
    technologies: 0,
    relations: 0,
  }
}

export async function seedKnowledgeCore(
  store: KnowledgeSeedStore,
): Promise<KnowledgeSeedResult> {
  const result: KnowledgeSeedResult = {
    created: emptyCounts(),
    reused: emptyCounts(),
  }

  const categories = new Map<string, SeedDocument>()
  for (const definition of categoryDefinitions) {
    categories.set(definition.value, await ensureDocument(store, definition, result))
  }

  const sources = new Map<string, SeedDocument>()
  for (const definition of sourceDefinitions) {
    sources.set(definition.value, await ensureDocument(store, definition, result))
  }

  const technologyDefinitions: SeedDefinition[] = [
    {
      collection: 'technologies',
      key: 'slug',
      value: 'next-js',
      data: {
        slug: 'next-js',
        canonical_name: 'Next.js',
        aliases: [{ alias: 'NextJS' }],
        short_description: 'Framework React destiné à la création d’applications web.',
        long_description:
          'Next.js fournit le routage, le rendu serveur et les outils nécessaires aux applications React modernes.',
        category: categories.get('framework-web')?.id,
        company: 'Vercel',
        license: 'MIT',
        primary_language: 'TypeScript',
        official_documentation_url: 'https://nextjs.org/docs',
        github_url: 'https://github.com/vercel/next.js',
        official_website_url: 'https://nextjs.org',
        editorial_status: 'published',
        freshness_status: 'fresh',
        verified_at: DEMO_VERIFIED_AT,
        meta_title: 'Next.js — Framework React',
        meta_description: 'Présentation de Next.js, framework React pour les applications web.',
        source_ids: [sources.get('https://nextjs.org/docs')?.id],
        _status: 'published',
      },
    },
    {
      collection: 'technologies',
      key: 'slug',
      value: 'payload-cms',
      data: {
        slug: 'payload-cms',
        canonical_name: 'Payload CMS',
        aliases: [{ alias: 'Payload' }],
        short_description: 'CMS headless open source construit avec TypeScript.',
        long_description:
          'Payload CMS réunit administration, API et gestion de contenu dans une application TypeScript.',
        category: categories.get('cms-headless')?.id,
        company: 'Payload',
        license: 'MIT',
        primary_language: 'TypeScript',
        official_documentation_url: 'https://payloadcms.com/docs',
        github_url: 'https://github.com/payloadcms/payload',
        official_website_url: 'https://payloadcms.com',
        editorial_status: 'published',
        freshness_status: 'fresh',
        verified_at: DEMO_VERIFIED_AT,
        meta_title: 'Payload CMS — CMS headless',
        meta_description: 'Présentation de Payload CMS, CMS headless open source en TypeScript.',
        source_ids: [sources.get('https://payloadcms.com/docs')?.id],
        _status: 'published',
      },
    },
    {
      collection: 'technologies',
      key: 'slug',
      value: 'postgresql',
      data: {
        slug: 'postgresql',
        canonical_name: 'PostgreSQL',
        aliases: [{ alias: 'Postgres' }],
        short_description: 'Système de gestion de base de données relationnelle open source.',
        category: categories.get('base-de-donnees-relationnelle')?.id,
        license: 'PostgreSQL License',
        primary_language: 'C',
        official_documentation_url: 'https://www.postgresql.org/docs',
        github_url: 'https://github.com/postgres/postgres',
        official_website_url: 'https://www.postgresql.org',
        editorial_status: 'published',
        freshness_status: 'fresh',
        verified_at: DEMO_VERIFIED_AT,
        meta_title: 'PostgreSQL — Base de données',
        meta_description: 'Présentation de PostgreSQL, base de données relationnelle open source.',
        source_ids: [sources.get('https://www.postgresql.org/docs')?.id],
        _status: 'published',
      },
    },
  ]

  const technologies = new Map<string, SeedDocument>()
  for (const definition of technologyDefinitions) {
    technologies.set(definition.value, await ensureDocument(store, definition, result))
  }

  const payloadID = technologies.get('payload-cms')?.id
  const nextID = technologies.get('next-js')?.id
  const payloadSourceID = sources.get('https://payloadcms.com/docs')?.id
  if (!payloadID || !nextID || !payloadSourceID) {
    throw new Error('Demo seed could not resolve the Relation dependencies')
  }

  const relationKey = `uses:${payloadID}:${nextID}`
  await ensureDocument(
    store,
    {
      collection: 'relations',
      key: 'canonical_key',
      value: relationKey,
      data: {
        source: payloadID,
        relation_type: 'uses',
        target: nextID,
        canonical_key: relationKey,
        source_ids: [payloadSourceID],
        verified_at: DEMO_VERIFIED_AT,
        editorial_status: 'published',
        archived: false,
        _status: 'published',
      },
    },
    result,
  )

  return result
}
