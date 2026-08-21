import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getApplicationPayload } from '../../../../../../lib/get-application-payload'
import { GPUComparator } from '../../GPUComparator'
import { type GPUOffer } from '../../gpu-data'
import { getGPUProvider, GPU_PROVIDERS } from '../../providers'
import styles from '../../provider.module.css'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const generateStaticParams = () => GPU_PROVIDERS.map(({ slug }) => ({ slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const provider = getGPUProvider((await params).slug)
  if (!provider) return {}
  return {
    alternates: { canonical: `/ressources/gpu/fournisseurs/${provider.slug}` },
    description: `${provider.summary} Découvrez ses services, avantages, limites et tarifs GPU cloud.`,
    title: `${provider.name} : services et tarifs GPU cloud`,
  }
}

const suggestedUses = (vram: number): GPUOffer['uses'] => vram >= 80 ? ['training', 'fine-tuning', 'inference'] : vram >= 24 ? ['fine-tuning', 'inference'] : ['inference']

export default async function GPUProviderPage({ params }: Props) {
  const provider = getGPUProvider((await params).slug)
  if (!provider) notFound()

  const payload = await getApplicationPayload()
  const requestTime = new Date()
  const freshnessThreshold = new Date(requestTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [prices, affiliateOffers] = await Promise.all([
    payload.find({ collection: 'gpu-prices', depth: 0, limit: 200, overrideAccess: false, pagination: false, sort: 'price_per_gpu_hour_usd', where: { and: [{ provider: { in: provider.priceNames } }, { available: { equals: true } }, { observed_at: { greater_than: freshnessThreshold } }] } }),
    payload.find({ collection: 'affiliate-offers', depth: 1, limit: 20, overrideAccess: false, pagination: false, where: { and: [{ status: { equals: 'active' } }, { commercial_relationship: { equals: 'affiliate' } }, { resource_type: { in: ['cloud', 'hosting'] } }] } }),
  ])
  const affiliate = affiliateOffers.docs.find((offer) => {
    const partner = offer.partner
    return typeof partner === 'object' && provider.priceNames.some((name) => name.toLocaleLowerCase('fr-FR') === partner.name.toLocaleLowerCase('fr-FR'))
  })
  const liveOffers: GPUOffer[] = prices.docs.map((price, index) => ({ gpu: price.gpu_model, id: index + 1, priceUsd: price.price_per_gpu_hour_usd, pricing: price.pricing_type, provider: price.provider, providerSlug: provider.slug, region: price.region, reliability: 4, url: price.source_url, uses: suggestedUses(price.vram_gb ?? 0), vram: price.vram_gb ?? 0 }))
  const offers = liveOffers.map((offer) => affiliate ? { ...offer, affiliate: true, providerSlug: provider.slug, url: `/go/${affiliate.slug}?${new URLSearchParams({ placement: 'gpu-provider-page', ref: provider.slug, src: 'web' })}` } : { ...offer, providerSlug: provider.slug })
  const externalUrl = affiliate ? `/go/${affiliate.slug}?${new URLSearchParams({ placement: 'gpu-provider-hero', ref: provider.slug, src: 'web' })}` : provider.website

  return <main className={styles.page} id="contenu">
    <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}><Link href="/ressources/gpu">Ressources GPU</Link><span>/</span><Link href="/ressources/gpu/fournisseurs">Fournisseurs</Link><span>/</span>{provider.name}</nav>
    <header className={styles.profileHero}>
      <div><p className={styles.eyebrow}>Fournisseur GPU cloud</p><h1>{provider.name}</h1><p className={styles.intro}>{provider.summary}</p></div>
      <aside className={styles.identity}><dl><div><dt>Siège</dt><dd>{provider.headquarters}</dd></div><div><dt>Couverture</dt><dd>{provider.regions}</dd></div><div><dt>Clients</dt><dd>{provider.clientScale}</dd></div></dl><a href={externalUrl} rel={affiliate ? 'sponsored noopener' : 'noopener noreferrer'} target="_blank">Découvrir {provider.name}{affiliate ? ' · Affilié' : ''}</a></aside>
    </header>
    <section className={styles.overview}><div><p className={styles.eyebrow}>En bref</p><h2>Ce que propose {provider.name}</h2><p>{provider.description}</p></div><div className={styles.serviceList}>{provider.services.map((service) => <span key={service}>{service}</span>)}</div></section>
    <section className={styles.prosCons}><article><p className={styles.eyebrow}>Points forts</p><h2>Pourquoi le choisir</h2><ul>{provider.advantages.map((item) => <li key={item}>{item}</li>)}</ul></article><article><p className={styles.eyebrow}>À vérifier</p><h2>Points de vigilance</h2><ul>{provider.limitations.map((item) => <li key={item}>{item}</li>)}</ul></article></section>
    <section className={styles.prices}><p className={styles.eyebrow}>Prix observés</p><h2>Tarifs GPU chez {provider.name}</h2><p className={styles.priceNote}>{liveOffers.length ? 'Tarifs récents issus directement des API fournisseurs.' : 'Aucun relevé API récent n’est disponible pour ce fournisseur.'}</p>{offers.length ? <GPUComparator offers={offers} /> : <p className={styles.empty}>Aucune donnée de test n’est affichée. Les tarifs apparaîtront dès qu’un connecteur réel sera disponible.</p>}</section>
    <footer className={styles.sources}><h2>Sources et transparence</h2><p>Informations éditoriales vérifiées à partir des pages officielles. Les effectifs clients ne sont indiqués que lorsqu’un chiffre public attribuable est disponible.</p><ul>{provider.sources.map((source) => <li key={source.url}><a href={source.url} rel="noopener noreferrer" target="_blank">{source.label}</a></li>)}</ul></footer>
  </main>
}
