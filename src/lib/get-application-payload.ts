import { getPayload } from 'payload'

/**
 * Load Payload only when a request needs it. Keeping the application config out
 * of module initialization lets Next.js inspect dynamic routes without a live
 * database connection during compilation.
 */
export async function getApplicationPayload() {
  const { default: config } = await import('@payload-config')
  return getPayload({ config })
}
