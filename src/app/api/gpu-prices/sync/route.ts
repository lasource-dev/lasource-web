import { timingSafeEqual } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'

import { getApplicationPayload } from '../../../../lib/get-application-payload'
import { syncGPUPrices } from '../../../../lib/gpu-pricing/sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const authorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(supplied)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await getApplicationPayload()
  const result = await syncGPUPrices(payload)
  if (result.errors.length) {
    console.error('[gpu-prices] Synchronisation partielle', result.errors)
  }
  return NextResponse.json(result, { status: result.errors.length ? 207 : 200 })
}
