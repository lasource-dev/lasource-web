import type { CollectionConfig } from 'payload'

import { isAdminUser } from './editorial/automation-access'

export const GPUPrices: CollectionConfig = {
  slug: 'gpu-prices',
  admin: {
    defaultColumns: ['provider', 'gpu_model', 'region', 'pricing_type', 'price_per_gpu_hour_usd', 'observed_at'],
    group: 'Ressources GPU',
    useAsTitle: 'external_key',
  },
  access: {
    create: ({ req }) => isAdminUser(req.user),
    delete: ({ req }) => isAdminUser(req.user),
    read: () => true,
    update: ({ req }) => isAdminUser(req.user),
  },
  fields: [
    { name: 'external_key', type: 'text', index: true, required: true, unique: true },
    {
      name: 'source',
      type: 'select',
      index: true,
      options: [
        { label: 'Azure Retail Prices', value: 'azure' },
        { label: 'RunPod', value: 'runpod' },
        { label: 'Vast.ai', value: 'vast' },
      ],
      required: true,
    },
    { name: 'provider', type: 'text', index: true, required: true },
    { name: 'provider_sku', type: 'text', required: true },
    { name: 'gpu_model', type: 'text', index: true, required: true },
    { name: 'gpu_count', type: 'number', min: 1, required: true },
    { name: 'vram_gb', type: 'number', min: 1 },
    { name: 'region', type: 'text', index: true, required: true },
    {
      name: 'pricing_type',
      type: 'select',
      index: true,
      options: [
        { label: 'À la demande', value: 'on-demand' },
        { label: 'Spot', value: 'spot' },
        { label: 'Réservé', value: 'reserved' },
      ],
      required: true,
    },
    { name: 'price_per_gpu_hour_usd', type: 'number', min: 0, required: true },
    { name: 'total_hourly_usd', type: 'number', min: 0, required: true },
    { name: 'available', type: 'checkbox', defaultValue: true, required: true },
    { name: 'source_url', type: 'text', required: true },
    { name: 'observed_at', type: 'date', index: true, required: true },
    { name: 'expires_at', type: 'date', index: true, required: true },
  ],
}
