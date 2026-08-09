import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { getPayload, type Payload } from 'payload'

import { normalizeSourceURL } from './collections/source/domain'
import config from './payload.config'

type FrontMatter = Record<string, unknown>
type ParsedContent = { body: string; data: FrontMatter }
type SourceDefinition = {
  checked_at: string
  publisher: string
  source_type: string
  title: string
  url: string
}

const requestedSourceRoot = process.argv[2] ?? process.env.CONTENT_SOURCE_DIR
if (!requestedSourceRoot) {
  throw new Error('Indiquez le dossier production-contenus en argument ou via CONTENT_SOURCE_DIR')
}
const sourceRoot = resolve(requestedSourceRoot)

function parseValue(value: string): unknown {
  if (value === 'null') return null
  if (value.startsWith('"') || value.startsWith('[')) return JSON.parse(value)
  return value
}

function parseMarkdown(source: string): ParsedContent {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Front matter absent')
  const data: FrontMatter = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1).trim())
  }
  return { body: match[2].trim(), data }
}

function parseSourceRegistry(source: string): Map<string, SourceDefinition> {
  const definitions = new Map<string, SourceDefinition>()
  let currentID: string | null = null
  let current: Partial<SourceDefinition> = {}

  const commit = () => {
    if (
      currentID &&
      current.title &&
      current.url &&
      current.publisher &&
      current.source_type &&
      current.checked_at
    ) {
      definitions.set(currentID, current as SourceDefinition)
    }
  }

  for (const line of source.split('\n')) {
    const idMatch = line.match(/^  ([a-z0-9-]+):$/)
    if (idMatch) {
      commit()
      currentID = idMatch[1]
      current = {}
      continue
    }
    const fieldMatch = line.match(/^    ([a-z_]+): "(.*)"$/)
    if (fieldMatch) {
      current[fieldMatch[1] as keyof SourceDefinition] = fieldMatch[2]
    }
  }
  commit()
  return definitions
}

async function loadDirectory(name: string): Promise<ParsedContent[]> {
  const directory = join(sourceRoot, name)
  const names = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort()
  return Promise.all(names.map(async (name) => parseMarkdown(await readFile(join(directory, name), 'utf8'))))
}

async function upsert(
  payload: Payload,
  collection: 'categories' | 'sources' | 'technologies' | 'editorial-contents',
  field: string,
  value: string,
  data: Record<string, unknown>,
): Promise<string> {
  const result = await payload.find({
    collection,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { [field]: { equals: value } },
  })
  const existing = result.docs[0]
  if (existing && !hasChanges(existing as unknown as Record<string, unknown>, data)) {
    return String(existing.id)
  }
  const document = existing
    ? await payload.update({
        collection,
        id: existing.id,
        data: data as never,
        draft: false,
        overrideAccess: true,
      })
    : await payload.create({
        collection,
        data: data as never,
        draft: false,
        overrideAccess: true,
      })
  return String(document.id)
}

function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable)
  if (value && typeof value === 'object') {
    if ('id' in value) return String(value.id)
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, comparable(entry)]),
    )
  }
  return value
}

function hasChanges(existing: Record<string, unknown>, incoming: Record<string, unknown>): boolean {
  return Object.entries(incoming).some(([key, value]) => {
    if (value === undefined) return false
    return JSON.stringify(comparable(existing[key])) !== JSON.stringify(comparable(value))
  })
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const statusForPayload = (value: unknown) =>
  value === 'published' ? ('published' as const) : ('draft' as const)

const sourceTypeForPayload = (value: string) => {
  if (value === 'official_releases' || value === 'official_repository') return 'github'
  if (value === 'standard') return 'rfc'
  return 'documentation'
}

const payload = await getPayload({ config })

try {
  const [categoryContents, technologyContents, guideContents, tutorialContents, registryText] =
    await Promise.all([
      loadDirectory('categories'),
      loadDirectory('technologies'),
      loadDirectory('guides'),
      loadDirectory('tutoriels'),
      readFile(join(sourceRoot, 'industrialisation/sources.yml'), 'utf8'),
    ])

  const sourceRegistry = parseSourceRegistry(registryText)
  const sourceIDs = new Map<string, string>()
  for (const [id, source] of sourceRegistry) {
    const normalizedURL = normalizeSourceURL(source.url)
    sourceIDs.set(
      id,
      await upsert(payload, 'sources', 'url', normalizedURL, {
        archived: false,
        author: source.publisher,
        confidence_score: 100,
        editorial_status: 'published',
        title: source.title,
        type: sourceTypeForPayload(source.source_type),
        url: normalizedURL,
        verified_at: `${source.checked_at}T00:00:00.000Z`,
        _status: 'published',
      }),
    )
  }

  const allCategorySlugs = new Set<string>()
  for (const content of [...categoryContents, ...technologyContents, ...guideContents, ...tutorialContents]) {
    for (const slug of asStrings(content.data.categories)) allCategorySlugs.add(slug)
  }

  const categoryBySlug = new Map(
    categoryContents.map((content) => [String(content.data.slug), content]),
  )
  const categoryIDs = new Map<string, string>()
  for (const slug of [...allCategorySlugs].sort()) {
    const content = categoryBySlug.get(slug)
    const title = content ? String(content.data.title) : slug.replaceAll('-', ' ')
    const description = content
      ? String(content.data.description)
      : `Contenus de référence consacrés à ${title}.`
    categoryIDs.set(
      slug,
      await upsert(payload, 'categories', 'slug', slug, {
        archived: false,
        canonical_name: title,
        editorial_status: content
          ? statusForPayload(content.data.publication_status)
          : 'published',
        long_description: content?.body,
        meta_description: description.slice(0, 160),
        meta_title: title.slice(0, 60),
        next_review_at: '2027-01-30T00:00:00.000Z',
        review_status: 'unreviewed',
        short_description: description,
        slug,
        _status: content ? statusForPayload(content.data.publication_status) : 'published',
      }),
    )
  }

  const technologyIDs = new Map<string, string>()
  for (const content of technologyContents) {
    const slug = String(content.data.slug)
    const categorySlug = asStrings(content.data.categories)[0]
    const referencedSources = asStrings(content.data.sources)
    const sourceDocuments = referencedSources.flatMap((id) => {
      const documentID = sourceIDs.get(id)
      return documentID ? [documentID] : []
    })
    const officialDocumentation = referencedSources
      .map((id) => sourceRegistry.get(id))
      .find((source) => source?.source_type === 'official_documentation')
    const github = referencedSources
      .map((id) => sourceRegistry.get(id))
      .find((source) => source?.url.includes('github.com'))

    technologyIDs.set(
      slug,
      await upsert(payload, 'technologies', 'slug', slug, {
        canonical_name: String(content.data.title),
        category: categoryIDs.get(categorySlug),
        editorial_status: statusForPayload(content.data.publication_status),
        freshness_status: 'unknown',
        github_url: github?.url,
        long_description: content.body,
        meta_description: String(content.data.description).slice(0, 160),
        meta_title: String(content.data.title).slice(0, 60),
        next_review_at: `${String(content.data.next_review_at)}T00:00:00.000Z`,
        official_documentation_url: officialDocumentation?.url,
        review_status: content.data.review_status,
        short_description: content.data.description,
        slug,
        source_ids: sourceDocuments,
        _status: statusForPayload(content.data.publication_status),
      }),
    )
  }

  for (const content of [...guideContents, ...tutorialContents]) {
    const sourceDocuments = asStrings(content.data.sources).flatMap((id) => {
      const documentID = sourceIDs.get(id)
      return documentID ? [documentID] : []
    })
    await upsert(payload, 'editorial-contents', 'slug', String(content.data.slug), {
      body_markdown: content.body,
      categories: asStrings(content.data.categories).flatMap((slug) => {
        const id = categoryIDs.get(slug)
        return id ? [id] : []
      }),
      content_type: content.data.type,
      description: content.data.description,
      editorial_status: statusForPayload(content.data.publication_status),
      level: content.data.level,
      meta_description: String(content.data.description).slice(0, 160),
      meta_title: String(content.data.title).slice(0, 60),
      next_review_at: `${String(content.data.next_review_at)}T00:00:00.000Z`,
      published_at: content.data.published_at
        ? `${String(content.data.published_at)}T00:00:00.000Z`
        : undefined,
      review_status: content.data.review_status,
      slug: content.data.slug,
      source_ids: sourceDocuments,
      technologies: asStrings(content.data.technologies).flatMap((slug) => {
        const id = technologyIDs.get(slug)
        return id ? [id] : []
      }),
      title: content.data.title,
      _status: statusForPayload(content.data.publication_status),
    })
  }

  payload.logger.info(
    `Import éditorial terminé : ${sourceIDs.size} sources, ${categoryIDs.size} catégories, ${technologyIDs.size} technologies, ${guideContents.length + tutorialContents.length} contenus.`,
  )
} finally {
  await payload.destroy()
}
