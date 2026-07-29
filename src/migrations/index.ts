import * as categoryResource from './20260720_203000_category_resource'

export const migrations = [
  {
    down: categoryResource.down,
    name: '20260720_203000_category_resource',
    up: categoryResource.up,
  },
]
