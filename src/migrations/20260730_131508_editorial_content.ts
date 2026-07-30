import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum__categories_v_version_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum_technologies_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum__technologies_v_version_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum_editorial_contents_content_type" AS ENUM('guide', 'tutorial');
  CREATE TYPE "public"."enum_editorial_contents_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all');
  CREATE TYPE "public"."enum_editorial_contents_editorial_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_editorial_contents_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum_editorial_contents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__editorial_contents_v_version_content_type" AS ENUM('guide', 'tutorial');
  CREATE TYPE "public"."enum__editorial_contents_v_version_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all');
  CREATE TYPE "public"."enum__editorial_contents_v_version_editorial_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum__editorial_contents_v_version_review_status" AS ENUM('unreviewed', 'in_review', 'validated', 'update_required');
  CREATE TYPE "public"."enum__editorial_contents_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "editorial_contents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"description" varchar,
  	"content_type" "enum_editorial_contents_content_type",
  	"level" "enum_editorial_contents_level",
  	"body_markdown" varchar,
  	"editorial_status" "enum_editorial_contents_editorial_status" DEFAULT 'draft',
  	"review_status" "enum_editorial_contents_review_status" DEFAULT 'unreviewed',
  	"published_at" timestamp(3) with time zone,
  	"reviewed_at" timestamp(3) with time zone,
  	"reviewed_by" varchar,
  	"next_review_at" timestamp(3) with time zone,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_editorial_contents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "editorial_contents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" uuid,
  	"technologies_id" uuid,
  	"sources_id" uuid
  );
  
  CREATE TABLE "_editorial_contents_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_content_type" "enum__editorial_contents_v_version_content_type",
  	"version_level" "enum__editorial_contents_v_version_level",
  	"version_body_markdown" varchar,
  	"version_editorial_status" "enum__editorial_contents_v_version_editorial_status" DEFAULT 'draft',
  	"version_review_status" "enum__editorial_contents_v_version_review_status" DEFAULT 'unreviewed',
  	"version_published_at" timestamp(3) with time zone,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_reviewed_by" varchar,
  	"version_next_review_at" timestamp(3) with time zone,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__editorial_contents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_editorial_contents_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" uuid,
  	"technologies_id" uuid,
  	"sources_id" uuid
  );
  
  ALTER TABLE "_categories_v" ADD COLUMN "version_review_status" "enum__categories_v_version_review_status" DEFAULT 'unreviewed';
  ALTER TABLE "_categories_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_categories_v" ADD COLUMN "version_reviewed_by" varchar;
  ALTER TABLE "_categories_v" ADD COLUMN "version_next_review_at" timestamp(3) with time zone;
  ALTER TABLE "_technologies_v" ADD COLUMN "version_review_status" "enum__technologies_v_version_review_status" DEFAULT 'unreviewed';
  ALTER TABLE "_technologies_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_technologies_v" ADD COLUMN "version_reviewed_by" varchar;
  ALTER TABLE "_technologies_v" ADD COLUMN "version_next_review_at" timestamp(3) with time zone;
  ALTER TABLE "categories" ADD COLUMN "review_status" "enum_categories_review_status" DEFAULT 'unreviewed';
  ALTER TABLE "categories" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "categories" ADD COLUMN "reviewed_by" varchar;
  ALTER TABLE "categories" ADD COLUMN "next_review_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "editorial_contents_id" uuid;
  ALTER TABLE "technologies" ADD COLUMN "review_status" "enum_technologies_review_status" DEFAULT 'unreviewed';
  ALTER TABLE "technologies" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "technologies" ADD COLUMN "reviewed_by" varchar;
  ALTER TABLE "technologies" ADD COLUMN "next_review_at" timestamp(3) with time zone;
  ALTER TABLE "editorial_contents_rels" ADD CONSTRAINT "editorial_contents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."editorial_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editorial_contents_rels" ADD CONSTRAINT "editorial_contents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editorial_contents_rels" ADD CONSTRAINT "editorial_contents_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editorial_contents_rels" ADD CONSTRAINT "editorial_contents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v" ADD CONSTRAINT "_editorial_contents_v_parent_id_editorial_contents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."editorial_contents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v_rels" ADD CONSTRAINT "_editorial_contents_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_editorial_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v_rels" ADD CONSTRAINT "_editorial_contents_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v_rels" ADD CONSTRAINT "_editorial_contents_v_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v_rels" ADD CONSTRAINT "_editorial_contents_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "editorial_contents_slug_idx" ON "editorial_contents" USING btree ("slug");
  CREATE INDEX "editorial_contents_content_type_idx" ON "editorial_contents" USING btree ("content_type");
  CREATE INDEX "editorial_contents_editorial_status_idx" ON "editorial_contents" USING btree ("editorial_status");
  CREATE INDEX "editorial_contents_review_status_idx" ON "editorial_contents" USING btree ("review_status");
  CREATE INDEX "editorial_contents_updated_at_idx" ON "editorial_contents" USING btree ("updated_at");
  CREATE INDEX "editorial_contents_created_at_idx" ON "editorial_contents" USING btree ("created_at");
  CREATE INDEX "editorial_contents__status_idx" ON "editorial_contents" USING btree ("_status");
  CREATE INDEX "editorial_contents_rels_order_idx" ON "editorial_contents_rels" USING btree ("order");
  CREATE INDEX "editorial_contents_rels_parent_idx" ON "editorial_contents_rels" USING btree ("parent_id");
  CREATE INDEX "editorial_contents_rels_path_idx" ON "editorial_contents_rels" USING btree ("path");
  CREATE INDEX "editorial_contents_rels_categories_id_idx" ON "editorial_contents_rels" USING btree ("categories_id");
  CREATE INDEX "editorial_contents_rels_technologies_id_idx" ON "editorial_contents_rels" USING btree ("technologies_id");
  CREATE INDEX "editorial_contents_rels_sources_id_idx" ON "editorial_contents_rels" USING btree ("sources_id");
  CREATE INDEX "_editorial_contents_v_parent_idx" ON "_editorial_contents_v" USING btree ("parent_id");
  CREATE INDEX "_editorial_contents_v_version_version_slug_idx" ON "_editorial_contents_v" USING btree ("version_slug");
  CREATE INDEX "_editorial_contents_v_version_version_content_type_idx" ON "_editorial_contents_v" USING btree ("version_content_type");
  CREATE INDEX "_editorial_contents_v_version_version_editorial_status_idx" ON "_editorial_contents_v" USING btree ("version_editorial_status");
  CREATE INDEX "_editorial_contents_v_version_version_review_status_idx" ON "_editorial_contents_v" USING btree ("version_review_status");
  CREATE INDEX "_editorial_contents_v_version_version_updated_at_idx" ON "_editorial_contents_v" USING btree ("version_updated_at");
  CREATE INDEX "_editorial_contents_v_version_version_created_at_idx" ON "_editorial_contents_v" USING btree ("version_created_at");
  CREATE INDEX "_editorial_contents_v_version_version__status_idx" ON "_editorial_contents_v" USING btree ("version__status");
  CREATE INDEX "_editorial_contents_v_created_at_idx" ON "_editorial_contents_v" USING btree ("created_at");
  CREATE INDEX "_editorial_contents_v_updated_at_idx" ON "_editorial_contents_v" USING btree ("updated_at");
  CREATE INDEX "_editorial_contents_v_latest_idx" ON "_editorial_contents_v" USING btree ("latest");
  CREATE INDEX "_editorial_contents_v_rels_order_idx" ON "_editorial_contents_v_rels" USING btree ("order");
  CREATE INDEX "_editorial_contents_v_rels_parent_idx" ON "_editorial_contents_v_rels" USING btree ("parent_id");
  CREATE INDEX "_editorial_contents_v_rels_path_idx" ON "_editorial_contents_v_rels" USING btree ("path");
  CREATE INDEX "_editorial_contents_v_rels_categories_id_idx" ON "_editorial_contents_v_rels" USING btree ("categories_id");
  CREATE INDEX "_editorial_contents_v_rels_technologies_id_idx" ON "_editorial_contents_v_rels" USING btree ("technologies_id");
  CREATE INDEX "_editorial_contents_v_rels_sources_id_idx" ON "_editorial_contents_v_rels" USING btree ("sources_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editorial_contents_fk" FOREIGN KEY ("editorial_contents_id") REFERENCES "public"."editorial_contents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_categories_v_version_version_review_status_idx" ON "_categories_v" USING btree ("version_review_status");
  CREATE INDEX "_technologies_v_version_version_review_status_idx" ON "_technologies_v" USING btree ("version_review_status");
  CREATE INDEX "categories_review_status_idx" ON "categories" USING btree ("review_status");
  CREATE INDEX "payload_locked_documents_rels_editorial_contents_id_idx" ON "payload_locked_documents_rels" USING btree ("editorial_contents_id");
  CREATE INDEX "technologies_review_status_idx" ON "technologies" USING btree ("review_status");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editorial_contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "editorial_contents_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_editorial_contents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_editorial_contents_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "editorial_contents" CASCADE;
  DROP TABLE "editorial_contents_rels" CASCADE;
  DROP TABLE "_editorial_contents_v" CASCADE;
  DROP TABLE "_editorial_contents_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_editorial_contents_fk";
  
  DROP INDEX "categories_review_status_idx";
  DROP INDEX "_categories_v_version_version_review_status_idx";
  DROP INDEX "technologies_review_status_idx";
  DROP INDEX "_technologies_v_version_version_review_status_idx";
  DROP INDEX "payload_locked_documents_rels_editorial_contents_id_idx";
  ALTER TABLE "categories" DROP COLUMN "review_status";
  ALTER TABLE "categories" DROP COLUMN "reviewed_at";
  ALTER TABLE "categories" DROP COLUMN "reviewed_by";
  ALTER TABLE "categories" DROP COLUMN "next_review_at";
  ALTER TABLE "_categories_v" DROP COLUMN "version_review_status";
  ALTER TABLE "_categories_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "_categories_v" DROP COLUMN "version_reviewed_by";
  ALTER TABLE "_categories_v" DROP COLUMN "version_next_review_at";
  ALTER TABLE "technologies" DROP COLUMN "review_status";
  ALTER TABLE "technologies" DROP COLUMN "reviewed_at";
  ALTER TABLE "technologies" DROP COLUMN "reviewed_by";
  ALTER TABLE "technologies" DROP COLUMN "next_review_at";
  ALTER TABLE "_technologies_v" DROP COLUMN "version_review_status";
  ALTER TABLE "_technologies_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "_technologies_v" DROP COLUMN "version_reviewed_by";
  ALTER TABLE "_technologies_v" DROP COLUMN "version_next_review_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "editorial_contents_id";
  DROP TYPE "public"."enum_categories_review_status";
  DROP TYPE "public"."enum__categories_v_version_review_status";
  DROP TYPE "public"."enum_technologies_review_status";
  DROP TYPE "public"."enum__technologies_v_version_review_status";
  DROP TYPE "public"."enum_editorial_contents_content_type";
  DROP TYPE "public"."enum_editorial_contents_level";
  DROP TYPE "public"."enum_editorial_contents_editorial_status";
  DROP TYPE "public"."enum_editorial_contents_review_status";
  DROP TYPE "public"."enum_editorial_contents_status";
  DROP TYPE "public"."enum__editorial_contents_v_version_content_type";
  DROP TYPE "public"."enum__editorial_contents_v_version_level";
  DROP TYPE "public"."enum__editorial_contents_v_version_editorial_status";
  DROP TYPE "public"."enum__editorial_contents_v_version_review_status";
  DROP TYPE "public"."enum__editorial_contents_v_version_status";`)
}
