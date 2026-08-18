import type { Payload } from 'payload'

import { azureConnector } from './azure'
import { createGoogleCloudConnector } from './google-cloud'
import { createRunPodConnector } from './runpod'
import { createScalewayConnector } from './scaleway'
import type { GPUPriceConnector, GPUPriceSource, NormalizedGPUPrice } from './types'
import { createVastConnector } from './vast'

const EXPIRY_HOURS = 26
const WRITE_CONCURRENCY = 10

export type SyncResult = {
  errors: Array<{ message: string; source: GPUPriceSource }>
  sources: Array<{ count: number; source: GPUPriceSource }>
  stored: number
}

const persistenceData = (price: NormalizedGPUPrice) => ({
  available: price.available,
  expires_at: new Date(new Date(price.observedAt).getTime() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
  external_key: price.externalKey,
  gpu_count: price.gpuCount,
  gpu_model: price.gpuModel,
  observed_at: price.observedAt,
  price_per_gpu_hour_usd: price.pricePerGpuHourUsd,
  pricing_type: price.pricingType,
  provider: price.provider,
  provider_sku: price.providerSku,
  region: price.region,
  source: price.source,
  source_url: price.sourceUrl,
  total_hourly_usd: price.totalHourlyUsd,
  vram_gb: price.vramGb,
})

export function configuredGPUConnectors(environment: Record<string, string | undefined> = process.env): GPUPriceConnector[] {
  const connectors: GPUPriceConnector[] = [
    createRunPodConnector(environment.RUNPOD_API_KEY),
    createVastConnector(environment.VAST_API_KEY),
    createScalewayConnector(environment.SCALEWAY_SECRET_KEY),
  ]
  const googleAPIKey = environment.GOOGLE_CLOUD_BILLING_API_KEY ?? environment.GOOGLE_CLOUD_API_KEY ?? environment.GOOGLE_API_KEY
  if (googleAPIKey) connectors.push(createGoogleCloudConnector(googleAPIKey))
  // Azure exposes hundreds of regional meters and is consequently the slowest
  // source to persist. Keep it last so a platform timeout cannot starve every
  // smaller provider during the same synchronization run.
  connectors.push(azureConnector)
  return connectors
}

const chunks = <Value>(values: Value[], size: number): Value[][] => {
  const result: Value[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}

export async function syncGPUPrices(payload: Payload, connectors = configuredGPUConnectors()): Promise<SyncResult> {
  const result: SyncResult = { errors: [], sources: [], stored: 0 }

  for (const connector of connectors) {
    try {
      const prices = await connector.fetchPrices()
      const existing = await payload.find({
        collection: 'gpu-prices',
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        pagination: false,
        where: { source: { equals: connector.source } },
      })
      const ids = new Map(existing.docs.map((document) => [document.external_key, document.id]))
      for (const batch of chunks(prices, WRITE_CONCURRENCY)) {
        await Promise.all(batch.map(async (price) => {
          const id = ids.get(price.externalKey)
          if (id) {
            await payload.update({ collection: 'gpu-prices', id, data: persistenceData(price), overrideAccess: true })
          } else {
            await payload.create({ collection: 'gpu-prices', data: persistenceData(price), overrideAccess: true })
          }
        }))
        result.stored += batch.length
      }
      result.sources.push({ count: prices.length, source: connector.source })
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : 'Unknown connector error',
        source: connector.source,
      })
    }
  }
  return result
}
