'use client'

import { Button, toast, useAuth, useSelection } from '@payloadcms/ui'
import { useState } from 'react'

type BulkUpdateResponse = {
  docs?: unknown[]
  errors?: Array<{ message?: string }>
  message?: string
}

export function BulkAcceptEditorialInsights() {
  const { user } = useAuth()
  const { count, getQueryParams, toggleAll } = useSelection()
  const [isUpdating, setIsUpdating] = useState(false)

  const acceptSelected = async () => {
    if (count === 0 || isUpdating) return

    setIsUpdating(true)

    try {
      const query = getQueryParams({ status: { equals: 'candidate' } })
      const response = await fetch(`/api/editorial-insights${query}`, {
        body: JSON.stringify({
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email || user?.id || 'admin',
          status: 'accepted',
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
      toast.success(`${updatedCount} insight${updatedCount > 1 ? 's' : ''} validé${updatedCount > 1 ? 's' : ''}.`)
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
        onClick={acceptSelected}
        size="small"
      >
        {isUpdating
          ? 'Validation en cours…'
          : `Valider ${count} insight${count > 1 ? 's' : ''}`}
      </Button>
      <span style={{ color: 'var(--theme-elevation-600)', fontSize: '13px' }}>
        Seuls les candidats sélectionnés seront validés.
      </span>
    </div>
  )
}
