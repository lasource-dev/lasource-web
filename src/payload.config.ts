import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Categories } from './collections/Categories'
import { Technologies } from './collections/Technologies'
import { EditorialContents } from './collections/EditorialContents'
import { Sources } from './collections/Sources'
import { Relations } from './collections/Relations'
import { AffiliatePartners } from './collections/AffiliatePartners'
import { AffiliateOffers } from './collections/AffiliateOffers'
import { AffiliateEvents } from './collections/AffiliateEvents'
import { readServerEnvironment } from './lib/env'

const environment = readServerEnvironment()

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [
    Users,
    Categories,
    Sources,
    Technologies,
    EditorialContents,
    Relations,
    AffiliatePartners,
    AffiliateOffers,
    AffiliateEvents,
  ],
  db: postgresAdapter({
    idType: 'uuid',
    push: false,
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
