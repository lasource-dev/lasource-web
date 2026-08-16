import type { GPUPriceConnector, NormalizedGPUPrice } from './types'

const ENDPOINT = 'https://console.vast.ai/api/v0/bundles/'
const SOURCE_URL = 'https://vast.ai'

type VastOffer = {
  dph_total?: number
  geolocation?: string
  gpu_name?: string
  gpu_ram?: number
  id?: number
  num_gpus?: number
  rentable?: boolean
}

type VastResponse = { offers?: VastOffer[] | { [key: string]: VastOffer } }

export function normalizeVastOffer(offer: VastOffer, observedAt: string): NormalizedGPUPrice | null {
  if (!offer.id || !offer.gpu_name || !offer.num_gpus || !offer.dph_total || offer.dph_total < 0) return null
  return {
    available: offer.rentable !== false,
    externalKey: `vast:${offer.id}:on-demand`,
    gpuCount: offer.num_gpus,
    gpuModel: offer.gpu_name.replaceAll('_', ' '),
    observedAt,
    pricePerGpuHourUsd: offer.dph_total / offer.num_gpus,
    pricingType: 'on-demand',
    provider: 'Vast.ai',
    providerSku: String(offer.id),
    region: offer.geolocation ?? 'non précisée',
    source: 'vast',
    sourceUrl: SOURCE_URL,
    totalHourlyUsd: offer.dph_total,
    vramGb: offer.gpu_ram ? offer.gpu_ram / 1024 : undefined,
  }
}

export function createVastConnector(apiKey: string): GPUPriceConnector {
  return {
    source: 'vast',
    async fetchPrices(fetcher = fetch) {
      const response = await fetcher(ENDPOINT, {
        body: JSON.stringify({ limit: 100, order: [['dph_total', 'asc']], rentable: { eq: true }, rented: { eq: false }, type: 'on-demand', verified: { eq: true } }),
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'User-Agent': 'LaSource.dev GPU comparator' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(`Vast.ai pricing returned ${response.status}`)
      const body = await response.json() as VastResponse
      const rawOffers = Array.isArray(body.offers) ? body.offers : Object.values(body.offers ?? {})
      const observedAt = new Date().toISOString()
      return rawOffers.map((offer) => normalizeVastOffer(offer, observedAt)).filter((price): price is NormalizedGPUPrice => Boolean(price))
    },
  }
}
