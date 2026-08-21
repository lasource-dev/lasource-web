'use client'

import { useMemo, useState } from 'react'

import { EUR_RATE, type GPUOffer } from './gpu-data'
import styles from './gpu.module.css'

const useLabels = { training: 'Entraînement', 'fine-tuning': 'Fine-tuning', inference: 'Inférence' }
const pricingLabels = { spot: 'Spot', 'on-demand': 'À la demande', reserved: 'Réservé' }
const providerOrder = ['Microsoft Azure', 'Google Cloud', 'Scaleway', 'RunPod', 'Vast.ai']

type Use = keyof typeof useLabels
type Pricing = keyof typeof pricingLabels

const canonicalGPU = (value: string) => {
  const normalized = value.replace(/NVIDIA|TESLA/gi, '').replaceAll('_', ' ').trim()
  const knownModel = normalized.match(/\b(B300|B200|H200|H100|A100|L40S|L40|L4|V100|P100|P40|P4|T4|A40|A30|A10)\b/i)?.[1]
  if (knownModel) return knownModel.toUpperCase()
  const rtx = normalized.match(/\bRTX\s*(PRO\s*)?(\d{4})(?:\s*(Ti|Super|S))?/i)
  if (rtx) return `RTX ${rtx[1] ? 'PRO ' : ''}${rtx[2]}${rtx[3] ? ` ${rtx[3].toUpperCase()}` : ''}`
  const gtx = normalized.match(/\bGTX\s*(\d{4})(?:\s*(Ti|S))?/i)
  if (gtx) return `GTX ${gtx[1]}${gtx[2] ? ` ${gtx[2].toUpperCase()}` : ''}`
  return normalized.replace(/\s+\d+\s*GB$/i, '').trim()
}

const geographicalZone = (region: string) => {
  const value = region.toLocaleLowerCase('fr-FR')
  if (value.includes('multi-region') || value.includes('global') || value.includes('monde')) return 'Monde'
  if (/europe|^(fr|nl|pl|it|de|uk|es|se|no|ch)-|france|germany|poland|italy|spain|sweden|norway|switzerland|united kingdom|ireland/.test(value)) return 'Europe'
  if (/^(us|ca)-|united states|canada|california|virginia|texas|florida|maryland|utah|indiana|carolina|quebec|saskatchewan/.test(value)) return 'Amérique du Nord'
  if (/asia|japan|korea|singapore|india|australia|taiwan|thailand|vietnam|malaysia|indonesia|shanghai|sichuan/.test(value)) return 'Asie-Pacifique'
  if (/brazil|south america/.test(value)) return 'Amérique du Sud'
  if (/africa|uae|emirates/.test(value)) return 'Afrique et Moyen-Orient'
  return 'Autres régions'
}

const canonicalVRAM = (gpu: string, vram: number) => {
  if (gpu === 'H100' && vram >= 75 && vram <= 88) return 80
  if (gpu === 'H200' && vram >= 135 && vram <= 150) return 141
  if (gpu === 'B300' && vram >= 285 && vram <= 312) return 288
  if (gpu === 'L40S' && vram >= 46 && vram <= 53) return 48
  if (gpu === 'L4' && vram >= 23 && vram <= 27) return 24
  return Math.round(vram * 10) / 10
}

export function GPUComparator({ offers: sourceOffers }: { offers: GPUOffer[] }) {
  const [gpu, setGpu] = useState('all')
  const [use, setUse] = useState<'all' | Use>('all')
  const [pricing, setPricing] = useState<'all' | Pricing>('all')
  const [zone, setZone] = useState('all')
  const [monthly, setMonthly] = useState(false)
  const [comparablesOnly, setComparablesOnly] = useState(true)

  const enrichedOffers = useMemo(() => sourceOffers.map((offer) => {
    const normalizedGPU = canonicalGPU(offer.gpu)
    return { ...offer, canonicalGPU: normalizedGPU, canonicalVRAM: canonicalVRAM(normalizedGPU, offer.vram), zone: geographicalZone(offer.region) }
  }), [sourceOffers])
  const gpuModels = useMemo(() => [...new Set(enrichedOffers.map((offer) => offer.canonicalGPU))].sort(), [enrichedOffers])
  const zones = useMemo(() => [...new Set(enrichedOffers.map((offer) => offer.zone))].sort(), [enrichedOffers])
  const providers = useMemo(() => [...new Set(sourceOffers.map((offer) => offer.provider))].sort((left, right) => {
    const leftIndex = providerOrder.indexOf(left)
    const rightIndex = providerOrder.indexOf(right)
    return (leftIndex < 0 ? providerOrder.length : leftIndex) - (rightIndex < 0 ? providerOrder.length : rightIndex)
  }), [sourceOffers])
  const pricingCounts = useMemo(() => enrichedOffers.reduce<Record<Pricing, number>>((counts, offer) => {
    counts[offer.pricing] += 1
    return counts
  }, { spot: 0, 'on-demand': 0, reserved: 0 }), [enrichedOffers])

  const filteredOffers = useMemo(() => enrichedOffers.filter((offer) =>
    (gpu === 'all' || offer.canonicalGPU === gpu) &&
    (use === 'all' || offer.uses.includes(use)) &&
    (pricing === 'all' || offer.pricing === pricing) &&
    (zone === 'all' || offer.zone === zone || (zone === 'Europe' && offer.zone === 'Monde')),
  ), [enrichedOffers, gpu, pricing, use, zone])

  const rows = useMemo(() => {
    const grouped = new Map<string, { gpu: string; offers: Map<string, GPUOffer>; vram: number }>()
    for (const offer of filteredOffers) {
      const key = `${offer.canonicalGPU}|${offer.canonicalVRAM}`
      const row = grouped.get(key) ?? { gpu: offer.canonicalGPU, offers: new Map(), vram: offer.canonicalVRAM }
      const current = row.offers.get(offer.provider)
      if (!current || offer.priceUsd < current.priceUsd) row.offers.set(offer.provider, offer)
      grouped.set(key, row)
    }
    return [...grouped.values()].filter((row) => !comparablesOnly || row.offers.size >= 2).sort((left, right) => left.gpu.localeCompare(right.gpu) || left.vram - right.vram)
  }, [comparablesOnly, filteredOffers])

  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: monthly ? 0 : 2 })
  const resetFilters = () => { setGpu('all'); setUse('all'); setPricing('all'); setZone('all') }
  const hasFilters = gpu !== 'all' || use !== 'all' || pricing !== 'all' || zone !== 'all'

  return <section aria-labelledby="comparateur" className={styles.comparator}>
    <div className={styles.comparatorHeading}><div><p className={styles.eyebrow}>Comparateur</p><h2 id="comparateur">Comparer par configuration</h2></div><p aria-live="polite"><strong>{rows.length}</strong> configuration{rows.length > 1 ? 's' : ''}</p></div>
    {sourceOffers.some((offer) => offer.affiliate) ? <p className={styles.disclosure}>Certaines offres comportent un lien affilié, clairement signalé. LaSource peut recevoir une commission sans surcoût pour vous. Cela ne modifie ni les prix affichés ni leur classement.</p> : null}
    <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
      <label>Modèle GPU<select onChange={(event) => setGpu(event.target.value)} value={gpu}><option value="all">Tous les modèles</option>{gpuModels.map((model) => <option key={model}>{model}</option>)}</select></label>
      <label>Zone<select onChange={(event) => setZone(event.target.value)} value={zone}><option value="all">Toutes les zones</option>{zones.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Cas d’usage<select onChange={(event) => setUse(event.target.value as 'all' | Use)} value={use}><option value="all">Tous les usages</option>{Object.entries(useLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Tarification<select onChange={(event) => setPricing(event.target.value as 'all' | Pricing)} value={pricing}><option value="all">Tous les types</option>{Object.entries(pricingLabels).map(([value, label]) => <option disabled={!pricingCounts[value as Pricing]} key={value} value={value}>{label} ({pricingCounts[value as Pricing]})</option>)}</select></label>
      <label className={styles.checkbox}><input checked={comparablesOnly} onChange={(event) => setComparablesOnly(event.target.checked)} type="checkbox" /> 2 fournisseurs minimum</label>
      <label className={styles.checkbox}><input checked={monthly} onChange={(event) => setMonthly(event.target.checked)} type="checkbox" /> Coût mensuel 24/7 <span className={styles.help} title="Estimation pour 730 heures, soit un mois moyen utilisé sans interruption">?</span></label>
      {hasFilters ? <button className={styles.reset} onClick={resetFilters} type="button">Réinitialiser</button> : null}
    </form>
    <div className={styles.tableWrapper} tabIndex={0}><table className={styles.matrix}>
      <caption className="visually-hidden">Meilleur tarif disponible par configuration et fournisseur</caption>
      <thead><tr><th>GPU</th><th>VRAM</th>{providers.map((provider) => <th key={provider}>{provider}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={`${row.gpu}-${row.vram}`}><th scope="row">{row.gpu}</th><td>{row.vram.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Go</td>{providers.map((provider) => {
        const offer = row.offers.get(provider)
        if (!offer) return <td className={styles.unavailable} key={provider}>—</td>
        const price = offer.priceUsd * EUR_RATE * (monthly ? 730 : 1)
        return <td className={styles.offerCell} key={provider}><span className={styles.price}>{euro.format(price)}{monthly ? '/mois' : '/h'}</span><span className={`${styles.tag} ${styles[offer.pricing]}`}>{pricingLabels[offer.pricing]}</span><span className={styles.region}>{offer.region}</span><a className={styles.cellCta} href={offer.url} rel={offer.affiliate ? 'sponsored noopener' : 'noopener noreferrer'} target="_blank">Voir l’offre{offer.affiliate ? ' · Affilié' : ''}<span className="visually-hidden"> de {offer.provider} (nouvel onglet)</span></a></td>
      })}</tr>)}</tbody>
    </table></div>
    {rows.length === 0 ? <div className={styles.empty}><p>Aucune offre ne correspond à ces critères.</p><button className={styles.reset} onClick={resetFilters} type="button">Réinitialiser les filtres</button></div> : null}
    <p className={styles.matrixNote}>Chaque cellule présente le tarif le moins cher actuellement relevé pour ce fournisseur et cette configuration. Utilisez le filtre de zone pour comparer une géographie précise ; la région technique retenue reste indiquée dans chaque cellule.</p>
  </section>
}
