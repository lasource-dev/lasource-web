import { describe, expect, it } from 'vitest'

import { readServerEnvironment } from './env'

const validEnvironment = {
  DATABASE_URI: 'postgresql://postgres:postgres@localhost:5432/lasource',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000/',
  PAYLOAD_SECRET: 'a-secure-secret-that-is-at-least-32-characters',
}

describe('readServerEnvironment', () => {
  it('returns a validated environment', () => {
    expect(readServerEnvironment(validEnvironment)).toEqual({
      ...validEnvironment,
      NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
    })
  })

  it('requires a PostgreSQL connection string', () => {
    expect(() =>
      readServerEnvironment({ ...validEnvironment, DATABASE_URI: undefined }),
    ).toThrow('DATABASE_URI is required')
  })

  it('rejects short Payload secrets', () => {
    expect(() => readServerEnvironment({ ...validEnvironment, PAYLOAD_SECRET: 'short' })).toThrow(
      'PAYLOAD_SECRET must contain at least 32 characters',
    )
  })

  it('rejects invalid public URLs', () => {
    expect(() =>
      readServerEnvironment({ ...validEnvironment, NEXT_PUBLIC_SERVER_URL: 'not-a-url' }),
    ).toThrow('NEXT_PUBLIC_SERVER_URL must be a valid absolute URL')
  })
})
