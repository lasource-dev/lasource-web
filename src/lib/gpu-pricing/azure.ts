import type { GPUPriceConnector, NormalizedGPUPrice } from './types'

const ENDPOINT = 'https://prices.azure.com/api/retail/prices'
const SOURCE_URL = 'https://azure.microsoft.com/pricing/details/virtual-machines/linux/'

type AzureGPUDefinition = { count: number; gpu: string; sku: string; vramGb: number }

// Azure bills complete VM shapes. Keeping this mapping explicit prevents us from
// presenting a VM price as if it were the price of an unidentified standalone GPU.
export const AZURE_GPU_DEFINITIONS: AzureGPUDefinition[] = [
  { sku: 'Standard_NC40ads_H100_v5', gpu: 'H100 80GB', count: 1, vramGb: 80 },
  { sku: 'Standard_NC80adis_H100_v5', gpu: 'H100 80GB', count: 2, vramGb: 80 },
  { sku: 'Standard_ND96isr_H100_v5', gpu: 'H100 80GB', count: 8, vramGb: 80 },
  { sku: 'Standard_ND96isr_H200_v5', gpu: 'H200 141GB', count: 8, vramGb: 141 },
  { sku: 'Standard_ND96amsr_A100_v4', gpu: 'A100 80GB', count: 8, vramGb: 80 },
  { sku: 'Standard_NC24ads_A100_v4', gpu: 'A100 80GB', count: 1, vramGb: 80 },
]

type AzureItem = {
  armRegionName?: string
  armSkuName?: string
  effectiveStartDate?: string
  effectiveEndDate?: string
  isPrimaryMeterRegion?: boolean
  meterName?: string
  productName?: string
  retailPrice?: number
  reservationTerm?: string
  skuId?: string
  type?: string
  unitOfMeasure?: string
}

type AzureResponse = { Items?: AzureItem[]; NextPageLink?: string | null }

export function normalizeAzureItem(item: AzureItem, observedAt: string): NormalizedGPUPrice | null {
  const definition = AZURE_GPU_DEFINITIONS.find(({ sku }) => sku === item.armSkuName)
  if (!definition || !item.skuId || !item.armRegionName || item.unitOfMeasure !== '1 Hour') return null
  if (typeof item.retailPrice !== 'number' || item.retailPrice < 0) return null
  if (item.type === 'DevTestConsumption' || item.productName?.includes('Windows')) return null
  if (item.effectiveStartDate && item.effectiveStartDate > observedAt) return null
  if (item.effectiveEndDate && item.effectiveEndDate <= observedAt) return null

  const label = `${item.meterName ?? ''} ${item.productName ?? ''}`.toLowerCase()
  const pricingType = label.includes('spot') || label.includes('low priority')
    ? 'spot'
    : item.type === 'Reservation'
      ? 'reserved'
      : 'on-demand'

  const reservationHours = item.reservationTerm === '1 Year'
    ? 365 * 24
    : item.reservationTerm === '3 Years'
      ? 3 * 365 * 24
      : null
  if (pricingType === 'reserved' && !reservationHours) return null
  const totalHourlyUsd = reservationHours ? item.retailPrice / reservationHours : item.retailPrice

  return {
    available: true,
    externalKey: `azure:${item.skuId}:${item.armRegionName}:${pricingType}`,
    gpuCount: definition.count,
    gpuModel: definition.gpu,
    observedAt,
    pricePerGpuHourUsd: totalHourlyUsd / definition.count,
    pricingType,
    provider: 'Microsoft Azure',
    providerSku: definition.sku,
    region: item.armRegionName,
    source: 'azure',
    sourceUrl: SOURCE_URL,
    totalHourlyUsd,
    vramGb: definition.vramGb,
  }
}

export const azureConnector: GPUPriceConnector = {
  source: 'azure',
  async fetchPrices(fetcher = fetch) {
    const observedAt = new Date().toISOString()
    const result: NormalizedGPUPrice[] = []

    for (const definition of AZURE_GPU_DEFINITIONS) {
      const filter = `serviceName eq 'Virtual Machines' and armSkuName eq '${definition.sku}'`
      let next: string | null = `${ENDPOINT}?currencyCode='USD'&$filter=${encodeURIComponent(filter)}`
      while (next) {
        const response = await fetcher(next, { headers: { Accept: 'application/json', 'User-Agent': 'LaSource.dev GPU comparator' } })
        if (!response.ok) throw new Error(`Azure pricing returned ${response.status}`)
        const body = await response.json() as AzureResponse
        result.push(...(body.Items ?? []).map((item) => normalizeAzureItem(item, observedAt)).filter((price): price is NormalizedGPUPrice => Boolean(price)))
        next = body.NextPageLink ?? null
      }
    }
    const deduplicated = new Map<string, NormalizedGPUPrice>()
    for (const price of result) deduplicated.set(price.externalKey, price)
    return [...deduplicated.values()]
  },
}
