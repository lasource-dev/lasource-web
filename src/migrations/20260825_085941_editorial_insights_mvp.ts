import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_editorial_insights_platform" AS ENUM('stack_exchange', 'github');
  CREATE TYPE "public"."enum_editorial_insights_type" AS ENUM('field_experience', 'pitfall', 'opinion', 'benchmark', 'technical_fact');
  CREATE TYPE "public"."enum_editorial_insights_status" AS ENUM('candidate', 'accepted', 'rejected', 'integrated');
  CREATE TYPE "public"."enum_editorial_insights_placement" AS ENUM('field_note', 'warning', 'diverging_view', 'inline_note');
  ALTER TYPE "public"."enum_sources_type" ADD VALUE 'stack_exchange';
  ALTER TYPE "public"."enum_sources_type" ADD VALUE 'community_discussion';
  ALTER TYPE "public"."enum__sources_v_version_type" ADD VALUE 'stack_exchange';
  ALTER TYPE "public"."enum__sources_v_version_type" ADD VALUE 'community_discussion';
  CREATE TABLE "editorial_insights" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"article_id" uuid NOT NULL,
  	"platform" "enum_editorial_insights_platform" NOT NULL,
  	"type" "enum_editorial_insights_type" NOT NULL,
  	"status" "enum_editorial_insights_status" DEFAULT 'candidate' NOT NULL,
  	"source_url" varchar NOT NULL,
  	"source_author" varchar,
  	"source_excerpt" varchar NOT NULL,
  	"proposed_rewrite" varchar,
  	"rewritten_text" varchar,
  	"source_id" uuid,
  	"placement" "enum_editorial_insights_placement",
  	"technology_context" varchar,
  	"engagement_score" numeric,
  	"corroboration_count" numeric DEFAULT 0 NOT NULL,
  	"collected_at" timestamp(3) with time zone NOT NULL,
  	"reviewed_at" timestamp(3) with time zone,
  	"reviewed_by" varchar,
  	"rejection_reason" varchar,
  	"collector_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "editorial_insights_id" uuid;
  ALTER TABLE "editorial_insights" ADD CONSTRAINT "editorial_insights_article_id_editorial_contents_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."editorial_contents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editorial_insights" ADD CONSTRAINT "editorial_insights_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "editorial_insights_article_idx" ON "editorial_insights" USING btree ("article_id");
  CREATE INDEX "editorial_insights_platform_idx" ON "editorial_insights" USING btree ("platform");
  CREATE INDEX "editorial_insights_status_idx" ON "editorial_insights" USING btree ("status");
  CREATE INDEX "editorial_insights_source_url_idx" ON "editorial_insights" USING btree ("source_url");
  CREATE INDEX "editorial_insights_source_idx" ON "editorial_insights" USING btree ("source_id");
  CREATE INDEX "editorial_insights_updated_at_idx" ON "editorial_insights" USING btree ("updated_at");
  CREATE INDEX "editorial_insights_created_at_idx" ON "editorial_insights" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editorial_insights_fk" FOREIGN KEY ("editorial_insights_id") REFERENCES "public"."editorial_insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_editorial_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("editorial_insights_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_editorial_insights_fk";
  ALTER TABLE "editorial_insights" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "editorial_insights" CASCADE;
  
  ALTER TABLE "sources" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_sources_type";
  CREATE TYPE "public"."enum_sources_type" AS ENUM('documentation', 'github', 'rfc', 'official_blog', 'video', 'scientific_publication');
  ALTER TABLE "sources" ALTER COLUMN "type" SET DATA TYPE "public"."enum_sources_type" USING "type"::"public"."enum_sources_type";
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__sources_v_version_type";
  CREATE TYPE "public"."enum__sources_v_version_type" AS ENUM('documentation', 'github', 'rfc', 'official_blog', 'video', 'scientific_publication');
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__sources_v_version_type" USING "version_type"::"public"."enum__sources_v_version_type";
  DROP INDEX "payload_locked_documents_rels_editorial_insights_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "editorial_insights_id";
  DROP TYPE "public"."enum_editorial_insights_platform";
  DROP TYPE "public"."enum_editorial_insights_type";
  DROP TYPE "public"."enum_editorial_insights_status";
  DROP TYPE "public"."enum_editorial_insights_placement";`)
}
