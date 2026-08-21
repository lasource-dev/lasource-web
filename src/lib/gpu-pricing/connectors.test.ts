import { describe, expect, it, vi } from 'vitest'

import { normalizeAzureItem } from './azure'
import { normalizeGoogleCloudSKU } from './google-cloud'
import { normalizeRunPodGPU } from './runpod'
import { createScalewayConnector, normalizeScalewayServer } from './scaleway'
import { configuredGPUConnectors } from './sync'
import { normalizeVastOffer } from './vast'

const observedAt = '2026-08-16T12:00:00.000Z'

describe('GPU pricing connectors', () => {
  it('normalizes an Azure multi-GPU VM to a per-GPU hourly price', () => {
    const price = normalizeAzureItem({
      armRegionName: 'westeurope',
      armSkuName: 'Standard_ND96isr_H100_v5',
      meterName: 'ND96isr H100 v5',
      retailPrice: 32,
      skuId: 'azure-sku',
      type: 'Consumption',
      unitOfMeasure: '1 Hour',
    }, observedAt)

    expect(price).toMatchObject({
      externalKey: 'azure:azure-sku:westeurope:on-demand',
      gpuCount: 8,
      gpuModel: 'H100 80GB',
      pricePerGpuHourUsd: 4,
      totalHourlyUsd: 32,
    })
  })

  it('converts an Azure reservation total to an hourly price', () => {
    const price = normalizeAzureItem({
      armRegionName: 'northeurope',
      armSkuName: 'Standard_NC40ads_H100_v5',
      meterName: 'NC40adsH100v5',
      productName: 'Virtual Machines NCadsH100v5 Series',
      reservationTerm: '1 Year',
      retailPrice: 43_800,
      skuId: 'reserved-sku',
      type: 'Reservation',
      unitOfMeasure: '1 Hour',
    }, observedAt)

    expect(price).toMatchObject({ pricePerGpuHourUsd: 5, pricingType: 'reserved' })
  })

  it('excludes Windows and Dev/Test Azure meters', () => {
    expect(normalizeAzureItem({
      armRegionName: 'northeurope', armSkuName: 'Standard_NC40ads_H100_v5', meterName: 'NC40adsH100v5',
      productName: 'Virtual Machines NCadsH100v5 Series Windows', retailPrice: 10, skuId: 'windows', type: 'Consumption', unitOfMeasure: '1 Hour',
    }, observedAt)).toBeNull()
    expect(normalizeAzureItem({
      armRegionName: 'northeurope', armSkuName: 'Standard_NC40ads_H100_v5', meterName: 'NC40adsH100v5',
      retailPrice: 5, skuId: 'devtest', type: 'DevTestConsumption', unitOfMeasure: '1 Hour',
    }, observedAt)).toBeNull()
  })

  it('normalizes RunPod price and availability', () => {
    expect(normalizeRunPodGPU({
      displayName: 'RTX 4090',
      id: 'NVIDIA GeForce RTX 4090',
      lowestPrice: { stockStatus: 'High', uninterruptablePrice: 0.44 },
      memoryInGb: 24,
    }, observedAt)).toMatchObject({ available: true, gpuModel: 'RTX 4090', pricePerGpuHourUsd: 0.44 })
  })

  it('normalizes a Vast.ai machine total to a per-GPU price', () => {
    expect(normalizeVastOffer({
      dph_total: 1.2,
      geolocation: 'FR',
      gpu_name: 'RTX_4090',
      gpu_ram: 24576,
      id: 42,
      num_gpus: 4,
      rentable: true,
    }, observedAt)).toMatchObject({ gpuCount: 4, gpuModel: 'RTX 4090', pricePerGpuHourUsd: 0.3, vramGb: 24 })
  })

  it('normalizes a Google Cloud GPU SKU', () => {
    expect(normalizeGoogleCloudSKU({
      category: { usageType: 'OnDemand' },
      description: 'Nvidia Tesla A100 80GB GPU attached to Spot VMs',
      geoTaxonomy: { regions: ['europe-west4'] },
      pricingInfo: [{ pricingExpression: { tieredRates: [{ startUsageAmount: 0, unitPrice: { units: '2', nanos: 250_000_000 } }], usageUnit: 'h' } }],
      skuId: 'google-sku',
    }, observedAt)).toMatchObject({ gpuModel: 'A100 80GB', pricePerGpuHourUsd: 2.25, provider: 'Google Cloud' })
  })

  it('normalizes a Scaleway multi-GPU instance and converts its euro price', () => {
    expect(normalizeScalewayServer('H100-2-80G', {
      available: true,
      gpu: 2,
      gpu_info: { gpu_memory: 80 * 1024 ** 3, gpu_name: 'NVIDIA H100' },
      hourly_price: { currency_code: 'EUR', units: '6', nanos: 880_000_000 },
    }, 'fr-par-2', observedAt)).toMatchObject({ gpuCount: 2, pricePerGpuHourUsd: 4, provider: 'Scaleway', vramGb: 80 })
  })

  it('falls back to the public Scaleway catalogue when an optional token is rejected', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.headers) return new Response(null, { status: 401 })
      return Response.json({
        servers: {
          'H100-1-80G': { gpu: 1, gpu_info: { gpu_memory: 80_000_000_000, gpu_name: 'H100-PCIe' }, hourly_price: 2.8665 },
        },
      })
    })

    const prices = await createScalewayConnector('rejected-token').fetchPrices(fetcher)

    expect(prices).toHaveLength(9)
    expect(prices[0]).toMatchObject({ gpuModel: 'H100-PCIe', provider: 'Scaleway' })
    expect(fetcher).toHaveBeenCalledTimes(18)
  })

  it('enables every public pricing connector without requiring API keys', () => {
    expect(configuredGPUConnectors({}).map(({ source }) => source)).toEqual(['runpod', 'vast', 'scaleway', 'azure'])
    expect(configuredGPUConnectors({ GOOGLE_CLOUD_BILLING_API_KEY: 'google', RUNPOD_API_KEY: 'runpod', SCALEWAY_SECRET_KEY: 'scaleway', VAST_API_KEY: 'vast' }).map(({ source }) => source)).toEqual(['runpod', 'vast', 'scaleway', 'google-cloud', 'azure'])
    expect(configuredGPUConnectors({ GOOGLE_CLOUD_API_KEY: 'google' }).map(({ source }) => source)).toContain('google-cloud')
  })
})
