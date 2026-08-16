export const GPU_PRICE_SOURCES = ['azure', 'runpod', 'vast'] as const
export type GPUPriceSource = (typeof GPU_PRICE_SOURCES)[number]

export type NormalizedGPUPrice = {
  available: boolean
  externalKey: string
  gpuCount: number
  gpuModel: string
  observedAt: string
  pricePerGpuHourUsd: number
  pricingType: 'on-demand' | 'reserved' | 'spot'
  provider: string
  providerSku: string
  region: string
  source: GPUPriceSource
  sourceUrl: string
  totalHourlyUsd: number
  vramGb?: number
}

export type GPUPriceConnector = {
  fetchPrices: (fetcher?: typeof fetch) => Promise<NormalizedGPUPrice[]>
  source: GPUPriceSource
}
