import * as migration_20260729_200000_initial_schema from './20260729_200000_initial_schema';
import * as migration_20260730_131508_editorial_content from './20260730_131508_editorial_content';

export const migrations = [
  {
    up: migration_20260729_200000_initial_schema.up,
    down: migration_20260729_200000_initial_schema.down,
    name: '20260729_200000_initial_schema',
  },
  {
    up: migration_20260730_131508_editorial_content.up,
    down: migration_20260730_131508_editorial_content.down,
    name: '20260730_131508_editorial_content'
  },
];
