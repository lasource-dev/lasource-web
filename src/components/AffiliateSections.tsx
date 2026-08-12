import Link from 'next/link'

import type { AffiliatePartner } from '../../payload-types'

import { AFFILIATE_SECTION_LABELS, isCommercialRelationship } from '../collections/affiliate/domain'
import type { AffiliateSection } from '../lib/affiliate-recommendations'

import styles from './affiliate-sections.module.css'

type AffiliateSectionsProps = {
  contentSlug: string
  sections: AffiliateSection[]
}

const partnerName = (partner: string | AffiliatePartner) =>
  typeof partner === 'object' ? partner.name : null

const selectionLabels = {
  editorial: 'Sélection éditoriale',
  expert_source: 'Recommandation documentée',
  researched: 'Évalué sur documentation',
  tested: 'Testé par LaSource',
} as const

const commercialLabels = {
  affiliate: 'Affilié',
  none: null,
  provided_access: 'Accès fourni',
  sponsored: 'Publicité',
} as const

export function AffiliateSections({ contentSlug, sections }: AffiliateSectionsProps) {
  if (!sections.length) return null

  return (
    <aside aria-label="Ressources recommandées" className={styles.container}>
      {sections.map((section) => {
        const commercial = section.offers.some((offer) =>
          isCommercialRelationship(offer.commercial_relationship),
        )

        return (
          <section className={styles.section} key={section.type}>
            <div className={styles.heading}>
              <h2>{AFFILIATE_SECTION_LABELS[section.type]}</h2>
              {commercial ? <span>Liens commerciaux</span> : null}
            </div>
            {commercial ? (
              <p className={styles.disclosure}>
                Cette sélection contient des relations commerciales clairement signalées sur
                chaque ressource. LaSource peut recevoir une commission sur les liens affiliés,
                sans surcoût pour vous. Cela n’influence pas notre sélection.{' '}
                <Link href="/politique-affiliation">Notre politique d’affiliation</Link>.
              </p>
            ) : null}
            <ul className={styles.grid}>
              {section.offers.map((offer) => {
                const isCommercial = isCommercialRelationship(offer.commercial_relationship)
                const query = new URLSearchParams({
                  placement: section.type,
                  ref: contentSlug,
                  src: 'web',
                })
                return (
                  <li className={styles.card} key={offer.id}>
                    <div className={styles.meta}>
                      <span>{selectionLabels[offer.selection_basis]}</span>
                      {commercialLabels[offer.commercial_relationship] ? (
                        <span>{commercialLabels[offer.commercial_relationship]}</span>
                      ) : null}
                    </div>
                    <h3>{offer.title}</h3>
                    {partnerName(offer.partner) ? (
                      <p className={styles.partner}>Par {partnerName(offer.partner)}</p>
                    ) : null}
                    <p>{offer.why_recommended}</p>
                    <dl>
                      <div>
                        <dt>Recommandé pour</dt>
                        <dd>{offer.best_for}</dd>
                      </div>
                      <div>
                        <dt>À savoir</dt>
                        <dd>{offer.limitations}</dd>
                      </div>
                    </dl>
                    <a
                      className={styles.cta}
                      href={`/go/${offer.slug}?${query.toString()}`}
                      rel={isCommercial ? 'sponsored noopener' : 'noopener'}
                      target="_blank"
                    >
                      {offer.cta_label}
                      <span className="visually-hidden"> (nouvel onglet)</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </aside>
  )
}
