'use client'

import { Button, toast, useAuth, useSelection } from '@payloadcms/ui'
import { useState } from 'react'

type BulkUpdateResponse = {
  docs?: unknown[]
  errors?: Array<{ message?: string }>
  message?: string
}

const nextReviewDate = (reviewedAt: Date) => {
  const nextReview = new Date(reviewedAt)
  nextReview.setUTCMonth(nextReview.getUTCMonth() + 6)
  return nextReview.toISOString()
}

export function BulkValidateEditorialContents() {
  const { user } = useAuth()
  const { count, getQueryParams, toggleAll } = useSelection()
  const [isUpdating, setIsUpdating] = useState(false)

  const validateSelected = async () => {
    if (count === 0 || isUpdating) return
    if (!window.confirm(`Valider la relecture de ${count} article${count > 1 ? 's' : ''} ?`)) return

    setIsUpdating(true)

    try {
      const reviewedAt = new Date()
      const response = await fetch(`/api/editorial-contents${getQueryParams()}`, {
        body: JSON.stringify({
          next_review_at: nextReviewDate(reviewedAt),
          review_status: 'validated',
          reviewed_at: reviewedAt.toISOString(),
          reviewed_by: user?.email || user?.id || 'admin',
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      const result = (await response.json()) as BulkUpdateResponse

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || result.message || 'La validation a échoué.')
      }

      const updatedCount = result.docs?.length ?? count
      toast.success(
        `${updatedCount} article${updatedCount > 1 ? 's' : ''} relu${updatedCount > 1 ? 's' : ''} et validé${updatedCount > 1 ? 's' : ''}.`,
      )
      toggleAll()
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'La validation a échoué.')
      setIsUpdating(false)
    }
  }

  if (count === 0) return null

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '12px', marginBottom: '16px' }}>
      <Button
        buttonStyle="primary"
        disabled={isUpdating}
        onClick={validateSelected}
        size="small"
      >
        {isUpdating
          ? 'Validation en cours…'
          : `Valider la relecture de ${count} article${count > 1 ? 's' : ''}`}
      </Button>
      <span style={{ color: 'var(--theme-elevation-600)', fontSize: '13px' }}>
        La date de relecture et la prochaine échéance à six mois seront enregistrées.
      </span>
    </div>
  )
}
