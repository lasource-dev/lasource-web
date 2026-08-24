import * as migration_20260729_200000_initial_schema from "./20260729_200000_initial_schema";
import * as migration_20260730_131508_editorial_content from "./20260730_131508_editorial_content";
import * as migration_20260809_162610_automation_identity from "./20260809_162610_automation_identity";
import * as migration_20260810_170800_sync_editorial_status from "./20260810_170800_sync_editorial_status";
import * as migration_20260812_105458_affiliate_recommendations from "./20260812_105458_affiliate_recommendations";
import * as migration_20260816_180000_gpu_prices from "./20260816_180000_gpu_prices";
import * as migration_20260817_160000_gpu_price_sources from "./20260817_160000_gpu_price_sources";
import * as migration_20260824_171500_category_hierarchy from "./20260824_171500_category_hierarchy";

export const migrations = [
  {
    up: migration_20260729_200000_initial_schema.up,
    down: migration_20260729_200000_initial_schema.down,
    name: "20260729_200000_initial_schema",
  },
  {
    up: migration_20260730_131508_editorial_content.up,
    down: migration_20260730_131508_editorial_content.down,
    name: "20260730_131508_editorial_content",
  },
  {
    up: migration_20260809_162610_automation_identity.up,
    down: migration_20260809_162610_automation_identity.down,
    name: "20260809_162610_automation_identity",
  },
  {
    up: migration_20260810_170800_sync_editorial_status.up,
    down: migration_20260810_170800_sync_editorial_status.down,
    name: "20260810_170800_sync_editorial_status",
  },
  {
    up: migration_20260812_105458_affiliate_recommendations.up,
    down: migration_20260812_105458_affiliate_recommendations.down,
    name: "20260812_105458_affiliate_recommendations",
  },
  {
    up: migration_20260816_180000_gpu_prices.up,
    down: migration_20260816_180000_gpu_prices.down,
    name: "20260816_180000_gpu_prices",
  },
  {
    up: migration_20260817_160000_gpu_price_sources.up,
    down: migration_20260817_160000_gpu_price_sources.down,
    name: "20260817_160000_gpu_price_sources",
  },
  {
    up: migration_20260824_171500_category_hierarchy.up,
    down: migration_20260824_171500_category_hierarchy.down,
    name: "20260824_171500_category_hierarchy",
  },
];
