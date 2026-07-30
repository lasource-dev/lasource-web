import { EditorialStatus, type EditorialStatusValue } from './EditorialStatus'
import styles from './trust.module.css'

export type ValidationLevel = 'editorial' | 'expert' | 'none'

export type TrustPassportData = {
  editorialStatus: EditorialStatusValue
  examplesTested?: boolean
  expertValidator?: string
  lastUpdated?: Date | string
  license?: string
  revisionCount?: number
  sourceCount?: number
  technologyVersion?: string
  validationLevel?: ValidationLevel
}

type TrustPassportProps = {
  data: TrustPassportData
  title?: string
}

type PassportDetail = {
  label: string
  value: string
}

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.valueOf())) return null

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date)
}

export const getValidationLabel = (
  validationLevel: ValidationLevel | undefined,
  expertValidator: string | undefined,
) => {
  if (validationLevel === 'expert' && expertValidator?.trim()) return 'Validation experte'
  if (validationLevel === 'editorial' || validationLevel === 'expert') {
    return 'Validation éditoriale'
  }
  if (validationLevel === 'none') return 'Non validé'
  return null
}

export const buildTrustPassportDetails = (data: TrustPassportData): PassportDetail[] => {
  const validation = getValidationLabel(data.validationLevel, data.expertValidator)
  const lastUpdated = data.lastUpdated ? formatDate(data.lastUpdated) : null
  const expertValidator = data.expertValidator?.trim()

  return [
    validation ? { label: 'Niveau de validation', value: validation } : null,
    lastUpdated ? { label: 'Dernière mise à jour', value: lastUpdated } : null,
    data.technologyVersion
      ? { label: 'Version concernée', value: data.technologyVersion }
      : null,
    data.sourceCount !== undefined
      ? {
          label: 'Sources',
          value: `${data.sourceCount} source${data.sourceCount === 1 ? '' : 's'}`,
        }
      : null,
    data.examplesTested !== undefined
      ? { label: 'Exemples testés', value: data.examplesTested ? 'Oui' : 'Non' }
      : null,
    expertValidator && data.validationLevel === 'expert'
      ? { label: 'Validation experte', value: expertValidator }
      : null,
    data.license ? { label: 'Réutilisation', value: data.license } : null,
    data.revisionCount !== undefined
      ? {
          label: 'Révisions',
          value: `${data.revisionCount} révision${data.revisionCount === 1 ? '' : 's'}`,
        }
      : null,
  ].filter((detail): detail is PassportDetail => detail !== null)
}

export function TrustPassport({
  data,
  title = 'Passeport de confiance',
}: TrustPassportProps) {
  const details = buildTrustPassportDetails(data)

  return (
    <aside aria-label={title} className={styles.passport}>
      <div className={styles.passportHeader}>
        <div>
          <p className={styles.passportEyebrow}>Traçabilité</p>
          <h2>{title}</h2>
        </div>
        <EditorialStatus status={data.editorialStatus} />
      </div>

      {details.length > 0 ? (
        <dl className={styles.passportDetails}>
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </aside>
  )
}
