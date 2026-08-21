import type { Metadata } from 'next'
import Link from 'next/link'

import { getApplicationPayload } from '../../../../lib/get-application-payload'
import { GPUComparator } from './GPUComparator'
import { EUR_RATE, type GPUOffer } from './gpu-data'
import { getGPUProviderSlug } from './providers'
import styles from './gpu.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/ressources/gpu' },
  description: 'Comparez des offres de location de GPU cloud par modèle, prix, région et cas d’usage.',
  title: 'Comparateur de GPU cloud',
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })

export const dynamic = 'force-dynamic'

const suggestedUses = (vram: number): GPUOffer['uses'] => {
  if (vram >= 80) return ['training', 'fine-tuning', 'inference']
  if (vram >= 24) return ['fine-tuning', 'inference']
  return ['inference']
}

export default async function GPUResourcesPage() {
  const payload = await getApplicationPayload()
  const requestTime = new Date()
  const freshnessThreshold = new Date(requestTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [result, affiliateOffers] = await Promise.all([
    payload.find({
      collection: 'gpu-prices',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: 'price_per_gpu_hour_usd',
      where: { and: [{ available: { equals: true } }, { observed_at: { greater_than: freshnessThreshold } }] },
    }),
    payload.find({
      collection: 'affiliate-offers',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          { status: { equals: 'active' } },
          { commercial_relationship: { equals: 'affiliate' } },
          { resource_type: { in: ['cloud', 'hosting'] } },
        ],
      },
    }),
  ])
  const affiliateSlugByProvider = new Map(
    affiliateOffers.docs.flatMap((offer) =>
      typeof offer.partner === 'object'
        ? [[offer.partner.name.toLocaleLowerCase('fr-FR'), offer.slug] as const]
        : [],
    ),
  )
  const liveOffers: GPUOffer[] = result.docs.map((price, index) => ({
    gpu: price.gpu_model,
    id: index + 1,
    priceUsd: price.price_per_gpu_hour_usd,
    pricing: price.pricing_type,
    provider: price.provider,
    region: price.region,
    reliability: 4,
    url: price.source_url,
    uses: suggestedUses(price.vram_gb ?? 0),
    vram: price.vram_gb ?? 0,
  }))
  const offers = liveOffers.map((offer) => {
    const providerSlug = getGPUProviderSlug(offer.provider)
    const affiliateSlug = affiliateSlugByProvider.get(offer.provider.toLocaleLowerCase('fr-FR'))
    if (!affiliateSlug) return { ...offer, providerSlug }
    const query = new URLSearchParams({ placement: 'gpu-comparator', ref: 'ressources-gpu', src: 'web' })
    return { ...offer, affiliate: true, providerSlug, url: `/go/${affiliateSlug}?${query.toString()}` }
  })
  const latestObservation = liveOffers.length
    ? result.docs.reduce((latest, price) => price.observed_at > latest ? price.observed_at : latest, result.docs[0]!.observed_at)
    : null
  const providers = new Set(offers.map((offer) => offer.provider)).size

  return <main className={styles.page} id="contenu">
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Ressources GPU</p>
      <h1>Trouver un GPU cloud adapté à votre projet</h1>
      <p className={styles.lead}>Comparez les offres par matériel, cas d’usage, mode de tarification et région. Cette première version sert à valider les critères utiles avant l’automatisation des relevés.</p>
      <dl className={styles.summary}>
        <div><dt>Relevés</dt><dd>{offers.length}</dd></div>
        <div><dt>Fournisseurs</dt><dd>{providers}</dd></div>
        <div><dt>Dernier relevé</dt><dd>{latestObservation ? dateFormatter.format(new Date(latestObservation)) : 'Indisponible'}</dd></div>
      </dl>
    </section>

    <aside className={styles.notice}>
      <strong>{latestObservation ? `Prix API relevés le ${dateFormatter.format(new Date(latestObservation))}.` : 'Aucun relevé API récent disponible.'}</strong>{' '}
      Mise à jour quotidienne. Prix indicatifs hors stockage, trafic, taxes et frais annexes ; vérifiez le tarif final avant toute location.
    </aside>

    <p><Link href="/ressources/gpu/fournisseurs">Découvrir les fiches détaillées des fournisseurs GPU cloud →</Link></p>

    {offers.length ? <GPUComparator offers={offers} /> : <p className={styles.empty}>Les données de test ne sont plus affichées. Les offres réapparaîtront après le prochain relevé API réussi.</p>}

    <section aria-labelledby="methodologie" className={styles.methodology}>
      <div><p className={styles.eyebrow}>Transparence</p><h2 id="methodologie">Comment lire ce comparateur</h2></div>
      <div>
        <p>Les prix sources sont exprimés en dollars et convertis avec un taux de démonstration de 1 USD = {EUR_RATE.toLocaleString('fr-FR')} EUR. L’estimation mensuelle correspond à 730 heures continues.</p>
        <p>Le badge « Moins cher » compare uniquement des offres utilisant le même modèle de GPU. L’indication ne constitue pas une recommandation : disponibilité, processeur, mémoire système, stockage, bande passante et conditions d’interruption peuvent changer le coût réel.</p>
        <p>Certains liens peuvent être affiliés et sont alors signalés sans modifier le classement des offres. Consultez notre <Link href="/politique-affiliation">politique d’affiliation</Link>.</p>
      </div>
    </section>
  </main>
}
