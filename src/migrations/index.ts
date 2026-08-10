import * as migration_20260729_200000_initial_schema from './20260729_200000_initial_schema';
import * as migration_20260730_131508_editorial_content from './20260730_131508_editorial_content';
import * as migration_20260809_162610_automation_identity from './20260809_162610_automation_identity';
import * as migration_20260810_170800_sync_editorial_status from './20260810_170800_sync_editorial_status';

export const migrations = [
  {
    up: migration_20260729_200000_initial_schema.up,
    down: migration_20260729_200000_initial_schema.down,
    name: '20260729_200000_initial_schema',
  },
  {
    up: migration_20260730_131508_editorial_content.up,
    down: migration_20260730_131508_editorial_content.down,
    name: '20260730_131508_editorial_content',
  },
  {
    up: migration_20260809_162610_automation_identity.up,
    down: migration_20260809_162610_automation_identity.down,
    name: '20260809_162610_automation_identity'
  },
  {
    up: migration_20260810_170800_sync_editorial_status.up,
    down: migration_20260810_170800_sync_editorial_status.down,
    name: '20260810_170800_sync_editorial_status'
  },
];
