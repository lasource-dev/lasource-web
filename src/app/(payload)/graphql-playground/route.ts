import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

const loadConfig = () => import('@payload-config').then(({ default: config }) => config)

export const GET = (request: Request) => GRAPHQL_PLAYGROUND_GET(loadConfig())(request)
