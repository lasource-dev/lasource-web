export type GPUOffer = {
  affiliate?: boolean
  gpu: string
  id: number
  priceUsd: number
  pricing: 'on-demand' | 'reserved' | 'spot'
  provider: string
  providerSlug?: string
  region: string
  reliability: 2 | 3 | 4 | 5
  url: string
  uses: Array<'fine-tuning' | 'inference' | 'training'>
  vram: number
}

export const GPU_DATA_DATE = '2026-08-16'
export const EUR_RATE = 0.86

export const GPU_OFFERS: GPUOffer[] = [
  { id: 1, provider: 'Vast.ai', gpu: 'H100 80GB', vram: 80, priceUsd: 1.87, pricing: 'spot', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 3, url: 'https://vast.ai' },
  { id: 2, provider: 'RunPod', gpu: 'H100 80GB', vram: 80, priceUsd: 1.99, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 4, url: 'https://runpod.io' },
  { id: 3, provider: 'Lambda', gpu: 'H100 80GB', vram: 80, priceUsd: 2.49, pricing: 'on-demand', region: 'États-Unis', uses: ['training', 'fine-tuning'], reliability: 5, url: 'https://lambdalabs.com' },
  { id: 4, provider: 'Fal', gpu: 'H100 80GB', vram: 80, priceUsd: 1.89, pricing: 'on-demand', region: 'États-Unis', uses: ['inference'], reliability: 4, url: 'https://fal.ai' },
  { id: 5, provider: 'CoreWeave', gpu: 'H100 80GB', vram: 80, priceUsd: 2.23, pricing: 'reserved', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning'], reliability: 5, url: 'https://coreweave.com' },
  { id: 6, provider: 'Google Cloud', gpu: 'H100 80GB', vram: 80, priceUsd: 3.4, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://cloud.google.com' },
  { id: 7, provider: 'AWS', gpu: 'H100 80GB', vram: 80, priceUsd: 3.93, pricing: 'reserved', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://aws.amazon.com' },
  { id: 8, provider: 'Vast.ai', gpu: 'A100 80GB', vram: 80, priceUsd: 0.89, pricing: 'spot', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 3, url: 'https://vast.ai' },
  { id: 9, provider: 'RunPod', gpu: 'A100 80GB', vram: 80, priceUsd: 1.19, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 4, url: 'https://runpod.io' },
  { id: 10, provider: 'Lambda', gpu: 'A100 80GB', vram: 80, priceUsd: 1.29, pricing: 'on-demand', region: 'États-Unis', uses: ['training', 'fine-tuning'], reliability: 5, url: 'https://lambdalabs.com' },
  { id: 11, provider: 'Google Cloud', gpu: 'A100 80GB', vram: 80, priceUsd: 2.21, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://cloud.google.com' },
  { id: 12, provider: 'Nebius', gpu: 'H200 141GB', vram: 141, priceUsd: 3.15, pricing: 'on-demand', region: 'Europe', uses: ['training', 'fine-tuning'], reliability: 4, url: 'https://nebius.com' },
  { id: 13, provider: 'RunPod', gpu: 'RTX 4090', vram: 24, priceUsd: 0.39, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['fine-tuning', 'inference'], reliability: 4, url: 'https://runpod.io' },
  { id: 14, provider: 'Vast.ai', gpu: 'RTX 4090', vram: 24, priceUsd: 0.22, pricing: 'spot', region: 'Europe / États-Unis', uses: ['fine-tuning', 'inference'], reliability: 3, url: 'https://vast.ai' },
  { id: 15, provider: 'TensorDock', gpu: 'RTX 4090', vram: 24, priceUsd: 0.28, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['fine-tuning', 'inference'], reliability: 3, url: 'https://tensordock.com' },
  { id: 16, provider: 'Scaleway', gpu: 'H100 80GB', vram: 80, priceUsd: 2.81, pricing: 'on-demand', region: 'Europe (France)', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://scaleway.com' },
  { id: 17, provider: 'OVHcloud', gpu: 'A100 80GB', vram: 80, priceUsd: 2.1, pricing: 'on-demand', region: 'Europe (France)', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://ovhcloud.com' },
  { id: 18, provider: 'Vast.ai', gpu: 'RTX 3090', vram: 24, priceUsd: 0.12, pricing: 'spot', region: 'Europe / États-Unis', uses: ['inference', 'fine-tuning'], reliability: 2, url: 'https://vast.ai' },
  { id: 19, provider: 'RunPod', gpu: 'L40S', vram: 48, priceUsd: 0.89, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['fine-tuning', 'inference'], reliability: 4, url: 'https://runpod.io' },
  { id: 20, provider: 'Nebius', gpu: 'B200 192GB', vram: 192, priceUsd: 4.8, pricing: 'on-demand', region: 'Europe', uses: ['training'], reliability: 4, url: 'https://nebius.com' },
  { id: 21, provider: 'Microsoft Azure', gpu: 'H100 80GB', vram: 80, priceUsd: 3.67, pricing: 'on-demand', region: 'Europe / États-Unis', uses: ['training', 'fine-tuning', 'inference'], reliability: 5, url: 'https://azure.microsoft.com' },
  { id: 22, provider: 'Scaleway', gpu: 'L40S', vram: 48, priceUsd: 1.12, pricing: 'on-demand', region: 'Europe (France)', uses: ['fine-tuning', 'inference'], reliability: 5, url: 'https://scaleway.com' },
]
