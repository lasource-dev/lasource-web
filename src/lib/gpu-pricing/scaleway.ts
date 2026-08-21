import type { GPUPriceConnector, NormalizedGPUPrice } from './types'

const API = 'https://api.scaleway.com/instance/v1/zones'
const SOURCE_URL = 'https://www.scaleway.com/en/pricing/gpu/'
const ZONES = ['fr-par-1', 'fr-par-2', 'fr-par-3', 'nl-ams-1', 'nl-ams-2', 'nl-ams-3', 'pl-waw-1', 'pl-waw-2', 'it-mil-1']
const EUR_TO_USD = 1 / 0.86

type Money = { currency_code?: string; nanos?: number; units?: string | number }
type ServerType = {
  available?: boolean
  gpu?: number
  gpu_info?: { gpu_memory?: number; gpu_name?: string }
  hourly_price?: Money | number
}
type ScalewayResponse = { servers?: Record<string, ServerType> }

const amountInUsd = (value?: Money | number) => {
  if (typeof value === 'number') return value
  const amount = Number(value?.units ?? 0) + (value?.nanos ?? 0) / 1_000_000_000
  return value?.currency_code === 'EUR' ? amount * EUR_TO_USD : amount
}

const vramGb = (memory?: number) => memory ? Math.round(memory / (1024 ** 3)) : undefined

export function normalizeScalewayServer(name: string, server: ServerType, zone: string, observedAt: string): NormalizedGPUPrice | null {
  const gpuCount = server.gpu ?? 0
  const totalHourly = amountInUsd(server.hourly_price)
  const gpuName = server.gpu_info?.gpu_name
  if (!gpuName || gpuCount < 1 || totalHourly <= 0) return null
  return {
    available: server.available !== false,
    externalKey: `scaleway:${zone}:${name}:on-demand`,
    gpuCount,
    gpuModel: gpuName.replace(/^NVIDIA\s+/i, ''),
    observedAt,
    pricePerGpuHourUsd: totalHourly / gpuCount,
    pricingType: 'on-demand',
    provider: 'Scaleway',
    providerSku: name,
    region: zone,
    source: 'scaleway',
    sourceUrl: SOURCE_URL,
    totalHourlyUsd: totalHourly,
    vramGb: vramGb(server.gpu_info?.gpu_memory),
  }
}

export function createScalewayConnector(secretKey?: string): GPUPriceConnector {
  return {
    source: 'scaleway',
    async fetchPrices(fetcher = fetch) {
      const observedAt = new Date().toISOString()
      const results = await Promise.all(ZONES.map(async (zone) => {
        const headers = secretKey ? { 'X-Auth-Token': secretKey } : undefined
        const url = `${API}/${zone}/products/servers`
        let response = await fetcher(url, { headers })
        // The product catalogue is public. A stale or mistyped optional token
        // must not make otherwise public GPU prices unavailable.
        if (secretKey && (response.status === 401 || response.status === 403)) {
          response = await fetcher(url)
        }
        if (response.status === 404) return []
        if (!response.ok) throw new Error(`Scaleway pricing for ${zone} returned ${response.status}`)
        const body = await response.json() as ScalewayResponse
        return Object.entries(body.servers ?? {}).map(([name, server]) => normalizeScalewayServer(name, server, zone, observedAt)).filter((price): price is NormalizedGPUPrice => Boolean(price))
      }))
      return results.flat()
    },
  }
}
