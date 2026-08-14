import { GRAPHQL_POST } from '@payloadcms/next/routes'

const loadConfig = () => import('@payload-config').then(({ default: config }) => config)

export const POST = (request: Request) => GRAPHQL_POST(loadConfig())(request)
