import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const RELATION_MIGRATION_UP_SQL = `
DO $$ BEGIN
  CREATE TYPE "enum_relations_relation_type" AS ENUM ('compatible_with', 'developed_by', 'depends_on', 'uses', 'supports', 'alternative_to', 'integrates_with', 'replaces');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_relations_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_relations_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__relations_v_version_relation_type" AS ENUM ('compatible_with', 'developed_by', 'depends_on', 'uses', 'supports', 'alternative_to', 'integrates_with', 'replaces');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__relations_v_version_editorial_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum__relations_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "relations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_id" uuid NOT NULL,
  "relation_type" "enum_relations_relation_type" NOT NULL,
  "target_id" uuid NOT NULL,
  "canonical_key" varchar NOT NULL,
  "verified_at" timestamp(3) with time zone,
  "editorial_status" "enum_relations_editorial_status" DEFAULT 'draft' NOT NULL,
  "archived" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "enum_relations_status" DEFAULT 'draft'
);
DO $$ BEGIN
  ALTER TABLE "relations" ADD CONSTRAINT "relations_source_id_technologies_id_fk"
    FOREIGN KEY ("source_id") REFERENCES "technologies"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "relations" ADD CONSTRAINT "relations_target_id_technologies_id_fk"
    FOREIGN KEY ("target_id") REFERENCES "technologies"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "relations_canonical_key_idx" ON "relations" ("canonical_key");
CREATE INDEX IF NOT EXISTS "relations_editorial_status_idx" ON "relations" ("editorial_status");
CREATE INDEX IF NOT EXISTS "relations_source_relation_type_idx" ON "relations" ("source_id", "relation_type");
CREATE INDEX IF NOT EXISTS "relations_target_relation_type_idx" ON "relations" ("target_id", "relation_type");
CREATE INDEX IF NOT EXISTS "relations_updated_at_idx" ON "relations" ("updated_at");
CREATE INDEX IF NOT EXISTS "relations_created_at_idx" ON "relations" ("created_at");
CREATE INDEX IF NOT EXISTS "relations__status_idx" ON "relations" ("_status");

CREATE TABLE IF NOT EXISTS "relations_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "sources_id" uuid
);
DO $$ BEGIN
  ALTER TABLE "relations_rels" ADD CONSTRAINT "relations_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "relations"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "relations_rels" ADD CONSTRAINT "relations_rels_sources_fk"
    FOREIGN KEY ("sources_id") REFERENCES "sources"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "relations_rels_order_idx" ON "relations_rels" ("order");
CREATE INDEX IF NOT EXISTS "relations_rels_parent_idx" ON "relations_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "relations_rels_path_idx" ON "relations_rels" ("path");
CREATE INDEX IF NOT EXISTS "relations_rels_sources_id_idx" ON "relations_rels" ("sources_id");

CREATE TABLE IF NOT EXISTS "_relations_v" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "version_source_id" uuid,
  "version_relation_type" "enum__relations_v_version_relation_type",
  "version_target_id" uuid,
  "version_canonical_key" varchar,
  "version_verified_at" timestamp(3) with time zone,
  "version_editorial_status" "enum__relations_v_version_editorial_status" DEFAULT 'draft',
  "version_archived" boolean DEFAULT false,
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "enum__relations_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest" boolean
);
DO $$ BEGIN
  ALTER TABLE "_relations_v" ADD CONSTRAINT "_relations_v_parent_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "relations"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_relations_v" ADD CONSTRAINT "_relations_v_version_source_id_technologies_id_fk"
    FOREIGN KEY ("version_source_id") REFERENCES "technologies"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_relations_v" ADD CONSTRAINT "_relations_v_version_target_id_technologies_id_fk"
    FOREIGN KEY ("version_target_id") REFERENCES "technologies"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "_relations_v_parent_idx" ON "_relations_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_relations_v_version_source_relation_type_idx" ON "_relations_v" ("version_source_id", "version_relation_type");
CREATE INDEX IF NOT EXISTS "_relations_v_version_target_relation_type_idx" ON "_relations_v" ("version_target_id", "version_relation_type");
CREATE INDEX IF NOT EXISTS "_relations_v_version_canonical_key_idx" ON "_relations_v" ("version_canonical_key");
CREATE INDEX IF NOT EXISTS "_relations_v_version_editorial_status_idx" ON "_relations_v" ("version_editorial_status");
CREATE INDEX IF NOT EXISTS "_relations_v_version__status_idx" ON "_relations_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_relations_v_created_at_idx" ON "_relations_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_relations_v_updated_at_idx" ON "_relations_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_relations_v_latest_idx" ON "_relations_v" ("latest");

CREATE TABLE IF NOT EXISTS "_relations_v_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "sources_id" uuid
);
DO $$ BEGIN
  ALTER TABLE "_relations_v_rels" ADD CONSTRAINT "_relations_v_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "_relations_v"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_relations_v_rels" ADD CONSTRAINT "_relations_v_rels_sources_fk"
    FOREIGN KEY ("sources_id") REFERENCES "sources"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "_relations_v_rels_order_idx" ON "_relations_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_relations_v_rels_parent_idx" ON "_relations_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_relations_v_rels_path_idx" ON "_relations_v_rels" ("path");
CREATE INDEX IF NOT EXISTS "_relations_v_rels_sources_id_idx" ON "_relations_v_rels" ("sources_id");

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "relations_id" uuid;
DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_relations_fk"
    FOREIGN KEY ("relations_id") REFERENCES "relations"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_relations_id_idx"
  ON "payload_locked_documents_rels" ("relations_id");
`

export const RELATION_MIGRATION_DOWN_SQL = `
DROP INDEX IF EXISTS "payload_locked_documents_rels_relations_id_idx";
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_relations_fk";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "relations_id";
DROP TABLE IF EXISTS "_relations_v_rels";
DROP TABLE IF EXISTS "_relations_v";
DROP TABLE IF EXISTS "relations_rels";
DROP TABLE IF EXISTS "relations";
DROP TYPE IF EXISTS "enum__relations_v_version_status";
DROP TYPE IF EXISTS "enum__relations_v_version_editorial_status";
DROP TYPE IF EXISTS "enum__relations_v_version_relation_type";
DROP TYPE IF EXISTS "enum_relations_status";
DROP TYPE IF EXISTS "enum_relations_editorial_status";
DROP TYPE IF EXISTS "enum_relations_relation_type";
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(RELATION_MIGRATION_UP_SQL))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(RELATION_MIGRATION_DOWN_SQL))
}
