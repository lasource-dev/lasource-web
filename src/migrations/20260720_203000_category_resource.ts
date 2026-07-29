import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const CATEGORY_MIGRATION_UP_SQL = `
DO $$ BEGIN
  CREATE TYPE "enum_categories_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_categories_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__categories_v_version_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__categories_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar,
  "canonical_name" varchar,
  "short_description" varchar,
  "long_description" varchar,
  "editorial_status" "enum_categories_editorial_status" DEFAULT 'draft',
  "archived" boolean DEFAULT false,
  "meta_title" varchar,
  "meta_description" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "enum_categories_status" DEFAULT 'draft'
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" ("slug");
CREATE INDEX IF NOT EXISTS "categories_canonical_name_idx" ON "categories" ("canonical_name");
CREATE INDEX IF NOT EXISTS "categories_editorial_status_idx" ON "categories" ("editorial_status");
CREATE INDEX IF NOT EXISTS "categories_updated_at_idx" ON "categories" ("updated_at");
CREATE INDEX IF NOT EXISTS "categories_created_at_idx" ON "categories" ("created_at");
CREATE INDEX IF NOT EXISTS "categories__status_idx" ON "categories" ("_status");

CREATE TABLE IF NOT EXISTS "categories_aliases" (
  "_order" integer NOT NULL,
  "_parent_id" uuid NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "alias" varchar
);
CREATE INDEX IF NOT EXISTS "categories_aliases_order_idx" ON "categories_aliases" ("_order");
CREATE INDEX IF NOT EXISTS "categories_aliases_parent_id_idx" ON "categories_aliases" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "categories_aliases" ADD CONSTRAINT "categories_aliases_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "categories"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "_categories_v" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "version_slug" varchar,
  "version_canonical_name" varchar,
  "version_short_description" varchar,
  "version_long_description" varchar,
  "version_editorial_status" "enum__categories_v_version_editorial_status" DEFAULT 'draft',
  "version_archived" boolean DEFAULT false,
  "version_meta_title" varchar,
  "version_meta_description" varchar,
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest" boolean
);
DO $$ BEGIN
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "_categories_v_parent_idx" ON "_categories_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version_slug_idx" ON "_categories_v" ("version_slug");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version_canonical_name_idx" ON "_categories_v" ("version_canonical_name");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version_editorial_status_idx" ON "_categories_v" ("version_editorial_status");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version_updated_at_idx" ON "_categories_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version_created_at_idx" ON "_categories_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_categories_v_version_version__status_idx" ON "_categories_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_categories_v_created_at_idx" ON "_categories_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_categories_v_updated_at_idx" ON "_categories_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_categories_v_latest_idx" ON "_categories_v" ("latest");

CREATE TABLE IF NOT EXISTS "_categories_v_version_aliases" (
  "_order" integer NOT NULL,
  "_parent_id" uuid NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "alias" varchar,
  "_uuid" varchar
);
CREATE INDEX IF NOT EXISTS "_categories_v_version_aliases_order_idx" ON "_categories_v_version_aliases" ("_order");
CREATE INDEX IF NOT EXISTS "_categories_v_version_aliases_parent_id_idx" ON "_categories_v_version_aliases" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "_categories_v_version_aliases" ADD CONSTRAINT "_categories_v_version_aliases_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_categories_v"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'technologies' AND column_name = 'category')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'technologies' AND column_name = 'legacy_category') THEN
    ALTER TABLE "technologies" RENAME COLUMN "category" TO "legacy_category";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_technologies_v' AND column_name = 'version_category')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_technologies_v' AND column_name = 'version_legacy_category') THEN
    ALTER TABLE "_technologies_v" RENAME COLUMN "version_category" TO "version_legacy_category";
  END IF;
END $$;

ALTER TABLE "technologies" ADD COLUMN IF NOT EXISTS "category_id" uuid;
ALTER TABLE "_technologies_v" ADD COLUMN IF NOT EXISTS "version_category_id" uuid;
ALTER TABLE "technologies" ADD COLUMN IF NOT EXISTS "legacy_category" varchar;
ALTER TABLE "_technologies_v" ADD COLUMN IF NOT EXISTS "version_legacy_category" varchar;

WITH legacy_names AS (
  SELECT DISTINCT COALESCE(NULLIF(regexp_replace(trim("legacy_category"), '\\s+', ' ', 'g'), ''), 'Non classée') AS canonical_name
  FROM "technologies"
  UNION
  SELECT DISTINCT COALESCE(NULLIF(regexp_replace(trim("version_legacy_category"), '\\s+', ' ', 'g'), ''), 'Non classée')
  FROM "_technologies_v"
), candidates AS (
  SELECT canonical_name,
    COALESCE(NULLIF(trim(both '-' from regexp_replace(lower(canonical_name), '[^a-z0-9]+', '-', 'g')), ''), 'category') AS base_slug
  FROM legacy_names
), resolved AS (
  SELECT canonical_name,
    CASE WHEN count(*) OVER (PARTITION BY base_slug) > 1
      OR EXISTS (SELECT 1 FROM "categories" c WHERE c.slug = candidates.base_slug AND lower(c.canonical_name) <> lower(candidates.canonical_name))
      THEN base_slug || '-' || substr(md5(lower(canonical_name)), 1, 8)
      ELSE base_slug
    END AS slug
  FROM candidates
)
INSERT INTO "categories" ("slug", "canonical_name", "short_description", "editorial_status", "archived", "_status")
SELECT slug, canonical_name, 'Catégorie migrée depuis « ' || canonical_name || ' ».', 'published', false, 'published'
FROM resolved
WHERE NOT EXISTS (
  SELECT 1 FROM "categories" existing WHERE lower(existing.canonical_name) = lower(resolved.canonical_name)
)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "technologies" technology
SET "category_id" = category.id
FROM "categories" category
WHERE lower(category.canonical_name) = lower(COALESCE(NULLIF(regexp_replace(trim(technology."legacy_category"), '\\s+', ' ', 'g'), ''), 'Non classée'))
  AND technology."category_id" IS NULL;

UPDATE "_technologies_v" technology_version
SET "version_category_id" = category.id
FROM "categories" category
WHERE lower(category.canonical_name) = lower(COALESCE(NULLIF(regexp_replace(trim(technology_version."version_legacy_category"), '\\s+', ' ', 'g'), ''), 'Non classée'))
  AND technology_version."version_category_id" IS NULL;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "technologies" WHERE "category_id" IS NULL) THEN
    RAISE EXCEPTION 'Category migration refused: an existing Technology was not assigned';
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE "technologies" ADD CONSTRAINT "technologies_category_id_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_technologies_v" ADD CONSTRAINT "_technologies_v_version_category_id_categories_id_fk"
    FOREIGN KEY ("version_category_id") REFERENCES "categories"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "technologies_category_idx" ON "technologies" ("category_id");
CREATE INDEX IF NOT EXISTS "_technologies_v_version_version_category_idx" ON "_technologies_v" ("version_category_id");

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "categories_id" uuid;
DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk"
    FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx"
  ON "payload_locked_documents_rels" ("categories_id");

`

export const CATEGORY_MIGRATION_DOWN_SQL = `
ALTER TABLE "technologies" ADD COLUMN IF NOT EXISTS "category" varchar;
UPDATE "technologies" technology SET "category" = category.canonical_name
FROM "categories" category WHERE technology."category_id" = category.id;
ALTER TABLE "_technologies_v" ADD COLUMN IF NOT EXISTS "version_category" varchar;
UPDATE "_technologies_v" technology_version SET "version_category" = category.canonical_name
FROM "categories" category WHERE technology_version."version_category_id" = category.id;

ALTER TABLE "technologies" DROP CONSTRAINT IF EXISTS "technologies_category_id_categories_id_fk";
ALTER TABLE "_technologies_v" DROP CONSTRAINT IF EXISTS "_technologies_v_version_category_id_categories_id_fk";
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_categories_fk";
DROP INDEX IF EXISTS "technologies_category_idx";
DROP INDEX IF EXISTS "_technologies_v_version_version_category_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_categories_id_idx";
ALTER TABLE "technologies" DROP COLUMN IF EXISTS "category_id";
ALTER TABLE "_technologies_v" DROP COLUMN IF EXISTS "version_category_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "categories_id";
ALTER TABLE "technologies" DROP COLUMN IF EXISTS "legacy_category";
ALTER TABLE "_technologies_v" DROP COLUMN IF EXISTS "version_legacy_category";

DROP TABLE IF EXISTS "_categories_v_version_aliases";
DROP TABLE IF EXISTS "_categories_v";
DROP TABLE IF EXISTS "categories_aliases";
DROP TABLE IF EXISTS "categories";
DROP TYPE IF EXISTS "enum__categories_v_version_status";
DROP TYPE IF EXISTS "enum__categories_v_version_editorial_status";
DROP TYPE IF EXISTS "enum_categories_status";
DROP TYPE IF EXISTS "enum_categories_editorial_status";
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(CATEGORY_MIGRATION_UP_SQL))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(CATEGORY_MIGRATION_DOWN_SQL))
}
