import type { GPUPriceConnector, NormalizedGPUPrice } from './types'

const API = 'https://cloudbilling.googleapis.com/v1'
const SOURCE_URL = 'https://cloud.google.com/compute/gpus-pricing'

type Money = { nanos?: number; units?: string }
type GoogleSKU = {
  category?: { resourceFamily?: string; usageType?: string }
  description?: string
  geoTaxonomy?: { regions?: string[] }
  name?: string
  pricingInfo?: Array<{ pricingExpression?: { tieredRates?: Array<{ startUsageAmount?: number; unitPrice?: Money }>; usageUnit?: string } }>
  serviceProviderName?: string
  skuId?: string
}
type ServicesResponse = { nextPageToken?: string; services?: Array<{ displayName?: string; name?: string }> }
type SKUsResponse = { nextPageToken?: string; skus?: GoogleSKU[] }

const gpuDefinition = (description: string) => {
  const candidates = [
    { pattern: /H200/i, model: 'H200 141GB', vram: 141 },
    { pattern: /H100/i, model: 'H100 80GB', vram: 80 },
    { pattern: /A100.*80 ?GB/i, model: 'A100 80GB', vram: 80 },
    { pattern: /A100/i, model: 'A100 40GB', vram: 40 },
    { pattern: /L40S/i, model: 'L40S', vram: 48 },
    { pattern: /NVIDIA L4|\bL4\b/i, model: 'L4', vram: 24 },
    { pattern: /T4/i, model: 'T4', vram: 16 },
    { pattern: /V100/i, model: 'V100', vram: 16 },
    { pattern: /P100/i, model: 'P100', vram: 16 },
    { pattern: /P4/i, model: 'P4', vram: 8 },
  ]
  return candidates.find(({ pattern }) => pattern.test(description))
}

const money = (value?: Money) => Number(value?.units ?? 0) + (value?.nanos ?? 0) / 1_000_000_000

export function normalizeGoogleCloudSKU(sku: GoogleSKU, observedAt: string): NormalizedGPUPrice | null {
  const description = sku.description ?? ''
  const definition = gpuDefinition(description)
  const expression = sku.pricingInfo?.[0]?.pricingExpression
  const rate = expression?.tieredRates?.find(({ startUsageAmount }) => !startUsageAmount)?.unitPrice
  const price = money(rate)
  if (!sku.skuId || !definition || expression?.usageUnit !== 'h' || price <= 0) return null
  const usageType = sku.category?.usageType?.toLowerCase() ?? ''
  const pricingType = usageType.includes('preemptible') || usageType.includes('spot') ? 'spot' : 'on-demand'
  const regions = sku.geoTaxonomy?.regions?.length ? sku.geoTaxonomy.regions : ['global']
  return {
    available: true,
    externalKey: `google-cloud:${sku.skuId}:${pricingType}`,
    gpuCount: 1,
    gpuModel: definition.model,
    observedAt,
    pricePerGpuHourUsd: price,
    pricingType,
    provider: 'Google Cloud',
    providerSku: sku.skuId,
    region: regions.join(', '),
    source: 'google-cloud',
    sourceUrl: SOURCE_URL,
    totalHourlyUsd: price,
    vramGb: definition.vram,
  }
}

export function createGoogleCloudConnector(apiKey: string): GPUPriceConnector {
  return {
    source: 'google-cloud',
    async fetchPrices(fetcher = fetch) {
      let servicesNext: string | null = `${API}/services?pageSize=5000&key=${encodeURIComponent(apiKey)}`
      let computeService: string | undefined
      while (servicesNext && !computeService) {
        const response = await fetcher(servicesNext)
        if (!response.ok) throw new Error(`Google Cloud catalog returned ${response.status}`)
        const body = await response.json() as ServicesResponse
        computeService = body.services?.find(({ displayName }) => displayName === 'Compute Engine')?.name
        servicesNext = body.nextPageToken ? `${API}/services?pageSize=5000&pageToken=${encodeURIComponent(body.nextPageToken)}&key=${encodeURIComponent(apiKey)}` : null
      }
      if (!computeService) throw new Error('Google Cloud Compute Engine service not found')

      const observedAt = new Date().toISOString()
      const prices: NormalizedGPUPrice[] = []
      let next: string | null = `${API}/${computeService}/skus?pageSize=5000&currencyCode=USD&key=${encodeURIComponent(apiKey)}`
      while (next) {
        const response = await fetcher(next)
        if (!response.ok) throw new Error(`Google Cloud SKUs returned ${response.status}`)
        const body = await response.json() as SKUsResponse
        prices.push(...(body.skus ?? []).map((sku) => normalizeGoogleCloudSKU(sku, observedAt)).filter((price): price is NormalizedGPUPrice => Boolean(price)))
        next = body.nextPageToken ? `${API}/${computeService}/skus?pageSize=5000&currencyCode=USD&pageToken=${encodeURIComponent(body.nextPageToken)}&key=${encodeURIComponent(apiKey)}` : null
      }
      return prices
    },
  }
}
