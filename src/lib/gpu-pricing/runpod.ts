import type { GPUPriceConnector, NormalizedGPUPrice } from './types'

const ENDPOINT = 'https://api.runpod.io/graphql'
const SOURCE_URL = 'https://www.runpod.io/pricing'

type RunPodGPU = {
  displayName?: string
  id?: string
  lowestPrice?: { stockStatus?: string; uninterruptablePrice?: number } | null
  memoryInGb?: number
}

type RunPodResponse = { data?: { gpuTypes?: RunPodGPU[] }; errors?: Array<{ message?: string }> }

export function normalizeRunPodGPU(gpu: RunPodGPU, observedAt: string): NormalizedGPUPrice | null {
  const price = gpu.lowestPrice?.uninterruptablePrice
  if (!gpu.id || !gpu.displayName || typeof price !== 'number' || price < 0) return null
  return {
    available: gpu.lowestPrice?.stockStatus !== 'None',
    externalKey: `runpod:${gpu.id}:community:on-demand`,
    gpuCount: 1,
    gpuModel: gpu.displayName,
    observedAt,
    pricePerGpuHourUsd: price,
    pricingType: 'on-demand',
    provider: 'RunPod',
    providerSku: gpu.id,
    region: 'multi-region',
    source: 'runpod',
    sourceUrl: SOURCE_URL,
    totalHourlyUsd: price,
    vramGb: gpu.memoryInGb,
  }
}

export function createRunPodConnector(apiKey?: string): GPUPriceConnector {
  return {
    source: 'runpod',
    async fetchPrices(fetcher = fetch) {
      const endpoint = apiKey ? `${ENDPOINT}?api_key=${encodeURIComponent(apiKey)}` : ENDPOINT
      const response = await fetcher(endpoint, {
        body: JSON.stringify({ query: '{ gpuTypes { id displayName memoryInGb lowestPrice(input: { gpuCount: 1 }) { stockStatus uninterruptablePrice } } }' }),
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'LaSource.dev GPU comparator' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(`RunPod pricing returned ${response.status}`)
      const body = await response.json() as RunPodResponse
      if (body.errors?.length) throw new Error(`RunPod GraphQL error: ${body.errors[0]?.message ?? 'unknown error'}`)
      const observedAt = new Date().toISOString()
      return (body.data?.gpuTypes ?? []).map((gpu) => normalizeRunPodGPU(gpu, observedAt)).filter((price): price is NormalizedGPUPrice => Boolean(price))
    },
  }
}
