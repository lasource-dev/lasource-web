import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'

import config from './payload.config'
import {
  seedKnowledgeCore,
  type KnowledgeSeedStore,
  type SeedCollection,
  type SeedData,
  type SeedDocument,
} from './seed/knowledge-core'

class PayloadKnowledgeSeedStore implements KnowledgeSeedStore {
  constructor(private readonly payload: Payload) {}

  async findOne(
    collection: SeedCollection,
    field: string,
    value: string,
  ): Promise<SeedDocument | null> {
    const result = await this.payload.find({
      collection,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { [field]: { equals: value } },
    })
    const document = result.docs[0]
    return document ? { id: String(document.id) } : null
  }

  async create(collection: SeedCollection, data: SeedData): Promise<SeedDocument> {
    const document = await this.payload.create({
      collection,
      data: data as RequiredDataFromCollectionSlug<typeof collection>,
      draft: false,
      overrideAccess: true,
    })
    return { id: String(document.id) }
  }
}

const payload = await getPayload({ config })
const result = await seedKnowledgeCore(new PayloadKnowledgeSeedStore(payload))

payload.logger.info(
  `Knowledge Core demo seed completed: ${JSON.stringify(result)}`,
)

await payload.destroy()
