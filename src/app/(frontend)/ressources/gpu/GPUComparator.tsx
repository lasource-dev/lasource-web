'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { EUR_RATE, type GPUOffer } from './gpu-data'
import styles from './gpu.module.css'

const useLabels = { training: 'Entraînement', 'fine-tuning': 'Fine-tuning', inference: 'Inférence' }
const pricingLabels = { spot: 'Spot', 'on-demand': 'À la demande', reserved: 'Réservé' }

type Use = keyof typeof useLabels
type Pricing = keyof typeof pricingLabels

export function GPUComparator({ offers: sourceOffers }: { offers: GPUOffer[] }) {
  const [gpu, setGpu] = useState('all')
  const [use, setUse] = useState<'all' | Use>('all')
  const [pricing, setPricing] = useState<'all' | Pricing>('all')
  const [europeOnly, setEuropeOnly] = useState(false)
  const [monthly, setMonthly] = useState(false)

  const gpuModels = useMemo(() => [...new Set(sourceOffers.map((offer) => offer.gpu))].sort(), [sourceOffers])
  const offers = useMemo(
    () => sourceOffers.filter((offer) =>
      (gpu === 'all' || offer.gpu === gpu) &&
      (use === 'all' || offer.uses.includes(use)) &&
      (pricing === 'all' || offer.pricing === pricing) &&
      (!europeOnly || offer.region.includes('Europe')),
    ).sort((a, b) => a.priceUsd - b.priceUsd),
    [europeOnly, gpu, pricing, sourceOffers, use],
  )

  const lowestByGpu = useMemo(() => {
    const result = new Map<string, number>()
    for (const offer of offers) {
      result.set(offer.gpu, Math.min(result.get(offer.gpu) ?? Number.POSITIVE_INFINITY, offer.priceUsd))
    }
    return result
  }, [offers])

  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: monthly ? 0 : 2 })

  return (
    <section aria-labelledby="comparateur" className={styles.comparator}>
      <div className={styles.comparatorHeading}>
        <div>
          <p className={styles.eyebrow}>Explorateur bêta</p>
          <h2 id="comparateur">Comparer les offres</h2>
        </div>
        <p aria-live="polite"><strong>{offers.length}</strong> offre{offers.length > 1 ? 's' : ''} affichée{offers.length > 1 ? 's' : ''}</p>
      </div>

      {sourceOffers.some((offer) => offer.affiliate) ? (
        <p className={styles.disclosure}>
          Certaines offres comportent un lien affilié, clairement signalé. LaSource peut recevoir
          une commission sans surcoût pour vous. Cela ne modifie ni les prix affichés ni leur
          classement.
        </p>
      ) : null}

      <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
        <label>Modèle GPU
          <select onChange={(event) => setGpu(event.target.value)} value={gpu}>
            <option value="all">Tous les modèles</option>
            {gpuModels.map((model) => <option key={model}>{model}</option>)}
          </select>
        </label>
        <label>Cas d’usage
          <select onChange={(event) => setUse(event.target.value as 'all' | Use)} value={use}>
            <option value="all">Tous les usages</option>
            {Object.entries(useLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Tarification
          <select onChange={(event) => setPricing(event.target.value as 'all' | Pricing)} value={pricing}>
            <option value="all">Tous les types</option>
            {Object.entries(pricingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.checkbox}><input checked={europeOnly} onChange={(event) => setEuropeOnly(event.target.checked)} type="checkbox" /> Europe uniquement</label>
        <label className={styles.checkbox}><input checked={monthly} onChange={(event) => setMonthly(event.target.checked)} type="checkbox" /> Estimation sur 730 h</label>
      </form>

      <div className={styles.tableWrapper} tabIndex={0}>
        <table>
          <caption className="visually-hidden">Offres de location de GPU filtrées par prix croissant</caption>
          <thead><tr><th>Fournisseur</th><th>GPU</th><th>VRAM</th><th>{monthly ? 'Estimation mensuelle' : 'Prix horaire'}</th><th>Type</th><th>Région</th><th><span className="visually-hidden">Accéder à l’offre</span></th></tr></thead>
          <tbody>
            {offers.map((offer) => {
              const bestForModel = offer.priceUsd === lowestByGpu.get(offer.gpu)
              const price = offer.priceUsd * EUR_RATE * (monthly ? 730 : 1)
              return <tr key={offer.id}>
                <td><strong>{offer.providerSlug ? <Link href={`/ressources/gpu/fournisseurs/${offer.providerSlug}`}>{offer.provider}</Link> : offer.provider}</strong></td>
                <td>{offer.gpu}</td>
                <td>{offer.vram} Go</td>
                <td><span className={styles.price}>{euro.format(price)}</span>{bestForModel ? <span className={styles.best}>Moins cher pour ce GPU</span> : null}</td>
                <td><span className={`${styles.tag} ${styles[offer.pricing]}`}>{pricingLabels[offer.pricing]}</span></td>
                <td>{offer.region}</td>
                <td>
                  <a
                    className={styles.cta}
                    href={offer.url}
                    rel={offer.affiliate ? 'sponsored noopener' : 'noopener noreferrer'}
                    target="_blank"
                  >
                    Voir l’offre{offer.affiliate ? ' · Affilié' : ''}
                    <span className="visually-hidden"> de {offer.provider} (nouvel onglet)</span>
                  </a>
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
      {offers.length === 0 ? <p className={styles.empty}>Aucune offre ne correspond à ces critères.</p> : null}
    </section>
  )
}
