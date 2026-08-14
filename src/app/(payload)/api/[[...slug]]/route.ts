import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

type RouteArguments = { params: Promise<{ slug?: string[] }> }

const loadConfig = () => import('@payload-config').then(({ default: config }) => config)

export const GET = (request: Request, args: RouteArguments) => REST_GET(loadConfig())(request, args)
export const POST = (request: Request, args: RouteArguments) => REST_POST(loadConfig())(request, args)
export const DELETE = (request: Request, args: RouteArguments) => REST_DELETE(loadConfig())(request, args)
export const PATCH = (request: Request, args: RouteArguments) => REST_PATCH(loadConfig())(request, args)
export const PUT = (request: Request, args: RouteArguments) => REST_PUT(loadConfig())(request, args)
export const OPTIONS = (request: Request, args: RouteArguments) => REST_OPTIONS(loadConfig())(request, args)
