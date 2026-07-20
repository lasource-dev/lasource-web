import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Technologies } from './collections/Technologies'
import { readServerEnvironment } from './lib/env'

const environment = readServerEnvironment()

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Technologies],
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: environment.DATABASE_URI,
    },
  }),
  secret: environment.PAYLOAD_SECRET,
  serverURL: environment.NEXT_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: './payload-types.ts',
  },
})
