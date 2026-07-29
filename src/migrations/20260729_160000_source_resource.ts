import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const SOURCE_MIGRATION_UP_SQL = `
DO $$ BEGIN
  CREATE TYPE "enum_sources_type" AS ENUM ('documentation', 'github', 'rfc', 'official_blog', 'video', 'scientific_publication');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_sources_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_sources_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__sources_v_version_type" AS ENUM ('documentation', 'github', 'rfc', 'official_blog', 'video', 'scientific_publication');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__sources_v_version_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__sources_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "url" varchar NOT NULL,
  "type" "enum_sources_type" NOT NULL,
  "title" varchar NOT NULL,
  "author" varchar,
  "published_at" timestamp(3) with time zone,
  "confidence_score" numeric DEFAULT 50 NOT NULL,
  "verified_at" timestamp(3) with time zone,
  "editorial_status" "enum_sources_editorial_status" DEFAULT 'draft' NOT NULL,
  "archived" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "enum_sources_status" DEFAULT 'draft'
);
CREATE UNIQUE INDEX IF NOT EXISTS "sources_url_idx" ON "sources" ("url");
CREATE INDEX IF NOT EXISTS "sources_type_idx" ON "sources" ("type");
CREATE INDEX IF NOT EXISTS "sources_verified_at_idx" ON "sources" ("verified_at");
CREATE INDEX IF NOT EXISTS "sources_editorial_status_idx" ON "sources" ("editorial_status");
CREATE INDEX IF NOT EXISTS "sources_updated_at_idx" ON "sources" ("updated_at");
CREATE INDEX IF NOT EXISTS "sources_created_at_idx" ON "sources" ("created_at");
CREATE INDEX IF NOT EXISTS "sources__status_idx" ON "sources" ("_status");

CREATE TABLE IF NOT EXISTS "_sources_v" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "version_url" varchar,
  "version_type" "enum__sources_v_version_type",
  "version_title" varchar,
  "version_author" varchar,
  "version_published_at" timestamp(3) with time zone,
  "version_confidence_score" numeric DEFAULT 50,
  "version_verified_at" timestamp(3) with time zone,
  "version_editorial_status" "enum__sources_v_version_editorial_status" DEFAULT 'draft',
  "version_archived" boolean DEFAULT false,
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "enum__sources_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest" boolean
);
DO $$ BEGIN
  ALTER TABLE "_sources_v" ADD CONSTRAINT "_sources_v_parent_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "sources"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "_sources_v_parent_idx" ON "_sources_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_sources_v_version_version_url_idx" ON "_sources_v" ("version_url");
CREATE INDEX IF NOT EXISTS "_sources_v_version_version_type_idx" ON "_sources_v" ("version_type");
CREATE INDEX IF NOT EXISTS "_sources_v_version_version_verified_at_idx" ON "_sources_v" ("version_verified_at");
CREATE INDEX IF NOT EXISTS "_sources_v_version_version_editorial_status_idx" ON "_sources_v" ("version_editorial_status");
CREATE INDEX IF NOT EXISTS "_sources_v_version_version__status_idx" ON "_sources_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_sources_v_created_at_idx" ON "_sources_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_sources_v_updated_at_idx" ON "_sources_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_sources_v_latest_idx" ON "_sources_v" ("latest");

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_source_ids')
    AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_legacy_source_ids') THEN
    ALTER TABLE "technologies_source_ids" RENAME TO "technologies_legacy_source_ids";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "technologies_legacy_source_ids"
    WHERE NULLIF(trim("source_url"), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'Source migration refused: a legacy reference has no URL';
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_legacy_source_ids') THEN
    INSERT INTO "sources" ("url", "type", "title", "confidence_score", "verified_at", "editorial_status", "archived", "_status")
    SELECT DISTINCT trim("source_url"), 'documentation', "source_id", 50, now(), 'published', false, 'published'
    FROM "technologies_legacy_source_ids"
    WHERE NULLIF(trim("source_url"), '') IS NOT NULL
    ON CONFLICT ("url") DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "technologies_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "sources_id" uuid
);
DO $$ BEGIN
  ALTER TABLE "technologies_rels" ADD CONSTRAINT "technologies_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "technologies"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "technologies_rels" ADD CONSTRAINT "technologies_rels_sources_fk"
    FOREIGN KEY ("sources_id") REFERENCES "sources"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "technologies_rels_order_idx" ON "technologies_rels" ("order");
CREATE INDEX IF NOT EXISTS "technologies_rels_parent_idx" ON "technologies_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "technologies_rels_path_idx" ON "technologies_rels" ("path");
CREATE INDEX IF NOT EXISTS "technologies_rels_sources_id_idx" ON "technologies_rels" ("sources_id");

CREATE TABLE IF NOT EXISTS "_technologies_v_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "sources_id" uuid
);
DO $$ BEGIN
  ALTER TABLE "_technologies_v_rels" ADD CONSTRAINT "_technologies_v_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "_technologies_v"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_technologies_v_rels" ADD CONSTRAINT "_technologies_v_rels_sources_fk"
    FOREIGN KEY ("sources_id") REFERENCES "sources"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "_technologies_v_rels_order_idx" ON "_technologies_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_technologies_v_rels_parent_idx" ON "_technologies_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_technologies_v_rels_path_idx" ON "_technologies_v_rels" ("path");
CREATE INDEX IF NOT EXISTS "_technologies_v_rels_sources_id_idx" ON "_technologies_v_rels" ("sources_id");

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_legacy_source_ids') THEN
    INSERT INTO "technologies_rels" ("order", "parent_id", "path", "sources_id")
    SELECT legacy."_order", legacy."_parent_id", 'source_ids', source.id
    FROM "technologies_legacy_source_ids" legacy
    JOIN "sources" source ON source.url = trim(legacy."source_url")
    WHERE NOT EXISTS (
      SELECT 1 FROM "technologies_rels" relation
      WHERE relation."parent_id" = legacy."_parent_id"
        AND relation."path" = 'source_ids'
        AND relation."sources_id" = source.id
    );
  END IF;
END $$;

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sources_id" uuid;
DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk"
    FOREIGN KEY ("sources_id") REFERENCES "sources"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sources_id_idx"
  ON "payload_locked_documents_rels" ("sources_id");
`

export const SOURCE_MIGRATION_DOWN_SQL = `
DELETE FROM "technologies_rels" WHERE "path" = 'source_ids';
DROP TABLE IF EXISTS "_technologies_v_rels";
DROP TABLE IF EXISTS "technologies_rels";
DROP INDEX IF EXISTS "payload_locked_documents_rels_sources_id_idx";
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_sources_fk";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "sources_id";
DROP TABLE IF EXISTS "_sources_v";
DROP TABLE IF EXISTS "sources";
DROP TYPE IF EXISTS "enum__sources_v_version_status";
DROP TYPE IF EXISTS "enum__sources_v_version_editorial_status";
DROP TYPE IF EXISTS "enum__sources_v_version_type";
DROP TYPE IF EXISTS "enum_sources_status";
DROP TYPE IF EXISTS "enum_sources_editorial_status";
DROP TYPE IF EXISTS "enum_sources_type";
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_legacy_source_ids')
    AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technologies_source_ids') THEN
    ALTER TABLE "technologies_legacy_source_ids" RENAME TO "technologies_source_ids";
  END IF;
END $$;
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(SOURCE_MIGRATION_UP_SQL))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(SOURCE_MIGRATION_DOWN_SQL))
}
