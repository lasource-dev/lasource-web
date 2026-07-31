const MINIMUM_SECRET_LENGTH = 32

export type ServerEnvironment = {
  DATABASE_URI: string
  NEXT_PUBLIC_SERVER_URL: string
  PAYLOAD_SECRET: string
}

export function readServerEnvironment(
  source: Record<string, string | undefined> = process.env,
): ServerEnvironment {
  // DATABASE_URL is managed by the Neon/Vercel integration. Keep
  // DATABASE_URI as the explicit override for local and legacy environments.
  const databaseURI = source.DATABASE_URI ?? source.DATABASE_URL
  const payloadSecret = source.PAYLOAD_SECRET
  const serverURL = source.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  if (!databaseURI) {
    throw new Error('DATABASE_URI or DATABASE_URL is required')
  }

  if (!payloadSecret || payloadSecret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(`PAYLOAD_SECRET must contain at least ${MINIMUM_SECRET_LENGTH} characters`)
  }

  try {
    new URL(serverURL)
  } catch {
    throw new Error('NEXT_PUBLIC_SERVER_URL must be a valid absolute URL')
  }

  return {
    DATABASE_URI: databaseURI,
    NEXT_PUBLIC_SERVER_URL: serverURL.replace(/\/$/, ''),
    PAYLOAD_SECRET: payloadSecret,
  }
}
