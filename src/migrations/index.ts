import * as categoryResource from './20260720_203000_category_resource'
import * as sourceResource from './20260729_160000_source_resource'
import * as relationResource from './20260729_183000_relation_resource'

export const migrations = [
  {
    down: categoryResource.down,
    name: '20260720_203000_category_resource',
    up: categoryResource.up,
  },
  {
    down: sourceResource.down,
    name: '20260729_160000_source_resource',
    up: sourceResource.up,
  },
  {
    down: relationResource.down,
    name: '20260729_183000_relation_resource',
    up: relationResource.up,
  },
]
