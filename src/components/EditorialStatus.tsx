import styles from './trust.module.css'

export const EDITORIAL_STATUS_LABELS = {
  archived: 'Archivé',
  draft: 'Brouillon',
  editorially_validated: 'Validé par la rédaction',
  expert_validated: 'Validé par un expert',
  in_review: 'En cours de revue',
  unreviewed: 'En attente de relecture',
  updating: 'Mise à jour en cours',
  update_required: 'Mise à jour nécessaire',
  validated: 'Validé',
} as const

export type EditorialStatusValue = keyof typeof EDITORIAL_STATUS_LABELS

type EditorialStatusProps = {
  className?: string
  status: EditorialStatusValue
}

export function EditorialStatus({ className, status }: EditorialStatusProps) {
  const classes = [styles.status, styles[`status_${status}`], className].filter(Boolean).join(' ')

  return (
    <span className={classes} data-status={status}>
      <span aria-hidden="true" className={styles.statusMarker}>
        {status === 'archived' ? '■' : '●'}
      </span>
      <span className={styles.visuallyHidden}>Statut éditorial : </span>
      {EDITORIAL_STATUS_LABELS[status]}
    </span>
  )
}
