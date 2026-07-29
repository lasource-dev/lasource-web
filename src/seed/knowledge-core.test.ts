import { describe, expect, it } from 'vitest'

import {
  seedKnowledgeCore,
  type KnowledgeSeedStore,
  type SeedCollection,
  type SeedData,
  type SeedDocument,
} from './knowledge-core'

type StoredDocument = SeedDocument & SeedData

class MemorySeedStore implements KnowledgeSeedStore {
  readonly documents: Record<SeedCollection, StoredDocument[]> = {
    categories: [],
    sources: [],
    technologies: [],
    relations: [],
  }

  private nextID = 1

  async findOne(
    collection: SeedCollection,
    field: string,
    value: string,
  ): Promise<SeedDocument | null> {
    return (
      this.documents[collection].find((document) => document[field] === value) ??
      null
    )
  }

  async create(collection: SeedCollection, data: SeedData): Promise<SeedDocument> {
    const document = { ...data, id: `demo-${this.nextID++}` }
    this.documents[collection].push(document)
    return document
  }
}

describe('Knowledge Core demo seed', () => {
  it('creates a minimal published and connected dataset', async () => {
    const store = new MemorySeedStore()

    const result = await seedKnowledgeCore(store)

    expect(result.created).toEqual({
      categories: 3,
      sources: 3,
      technologies: 3,
      relations: 1,
    })
    expect(store.documents.technologies).toHaveLength(3)
    expect(store.documents.technologies.every((item) => item._status === 'published')).toBe(true)
    expect(store.documents.technologies.find((item) => item.slug === 'next-js')).toMatchObject({
      editorial_status: 'published',
      freshness_status: 'fresh',
    })
    expect(store.documents.relations[0]).toMatchObject({
      editorial_status: 'published',
      relation_type: 'uses',
    })
  })

  it('is re-runnable without creating duplicates', async () => {
    const store = new MemorySeedStore()
    await seedKnowledgeCore(store)

    const secondResult = await seedKnowledgeCore(store)

    expect(secondResult.created).toEqual({
      categories: 0,
      sources: 0,
      technologies: 0,
      relations: 0,
    })
    expect(secondResult.reused).toEqual({
      categories: 3,
      sources: 3,
      technologies: 3,
      relations: 1,
    })
    expect(Object.values(store.documents).flat()).toHaveLength(10)
  })

  it('does not modify an existing document sharing a seed key', async () => {
    const store = new MemorySeedStore()
    store.documents.categories.push({
      id: 'existing-category',
      slug: 'framework-web',
      canonical_name: 'Nom éditorial existant',
    })

    await seedKnowledgeCore(store)

    expect(store.documents.categories.find((item) => item.id === 'existing-category')).toEqual({
      id: 'existing-category',
      slug: 'framework-web',
      canonical_name: 'Nom éditorial existant',
    })
    expect(store.documents.categories).toHaveLength(3)
  })
})
