import type { EditorialInsight } from '../../payload-types'

import styles from './editorial-insights.module.css'

type EditorialInsightsProps = {
  insights: readonly EditorialInsight[]
}

const TYPE_LABELS: Record<EditorialInsight['type'], string> = {
  benchmark: 'Mesure observée',
  field_experience: 'Retour du terrain',
  opinion: 'Point de vue',
  pitfall: 'Point de vigilance',
  technical_fact: 'Précision technique',
}

export function EditorialInsights({ insights }: EditorialInsightsProps) {
  if (insights.length === 0) return null

  return (
    <section aria-labelledby="editorial-insights" className={styles.section}>
      <p className={styles.eyebrow}>Expérience de la communauté</p>
      <h2 id="editorial-insights">Ce que signalent les praticiens</h2>
      <div className={styles.grid}>
        {insights.map((insight) => {
          const text = insight.rewritten_text?.trim() || insight.proposed_rewrite?.trim()
          if (!text) return null

          return (
            <article className={styles.card} key={insight.id}>
              <p className={styles.kind}>{TYPE_LABELS[insight.type]}</p>
              <h3>{insight.title}</h3>
              <p>{text}</p>
              <a href={insight.source_url} rel="noreferrer" target="_blank">
                Voir la discussion sur {insight.platform === 'github' ? 'GitHub' : 'Stack Exchange'}
                <span className={styles.visuallyHidden}> (s’ouvre dans un nouvel onglet)</span>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
