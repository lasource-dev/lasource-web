import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_affiliate_partners_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_affiliate_offers_content_types" AS ENUM('guide', 'tutorial');
  CREATE TYPE "public"."enum_affiliate_offers_levels" AS ENUM('beginner', 'intermediate', 'advanced', 'all');
  CREATE TYPE "public"."enum_affiliate_offers_resource_type" AS ENUM('book', 'course', 'developer_tool', 'cloud', 'hosting', 'monitoring', 'certification', 'free_resource');
  CREATE TYPE "public"."enum_affiliate_offers_selection_basis" AS ENUM('tested', 'researched', 'expert_source', 'editorial');
  CREATE TYPE "public"."enum_affiliate_offers_commercial_relationship" AS ENUM('none', 'affiliate', 'sponsored', 'provided_access');
  CREATE TYPE "public"."enum_affiliate_offers_status" AS ENUM('active', 'paused', 'expired');
  CREATE TYPE "public"."enum_affiliate_events_channel" AS ENUM('web', 'mcp', 'newsletter');
  CREATE TABLE "affiliate_partners" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar NOT NULL,
    "website_url" varchar,
    "logo_url" varchar,
    "status" "enum_affiliate_partners_status" DEFAULT 'active' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "affiliate_offers_content_types" (
    "order" integer NOT NULL,
    "parent_id" uuid NOT NULL,
    "value" "enum_affiliate_offers_content_types",
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "affiliate_offers_levels" (
    "order" integer NOT NULL,
    "parent_id" uuid NOT NULL,
    "value" "enum_affiliate_offers_levels",
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "affiliate_offers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" varchar NOT NULL,
    "title" varchar NOT NULL,
    "partner_id" uuid NOT NULL,
    "resource_type" "enum_affiliate_offers_resource_type" NOT NULL,
    "why_recommended" varchar NOT NULL,
    "best_for" varchar NOT NULL,
    "limitations" varchar NOT NULL,
    "selection_basis" "enum_affiliate_offers_selection_basis" NOT NULL,
    "last_verified_at" timestamp(3) with time zone NOT NULL,
    "commercial_relationship" "enum_affiliate_offers_commercial_relationship" DEFAULT 'affiliate' NOT NULL,
    "destination_url" varchar NOT NULL,
    "cta_label" varchar DEFAULT 'Découvrir la ressource' NOT NULL,
    "priority" numeric DEFAULT 50 NOT NULL,
    "status" "enum_affiliate_offers_status" DEFAULT 'active' NOT NULL,
    "starts_at" timestamp(3) with time zone,
    "ends_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "affiliate_offers_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" uuid NOT NULL,
    "path" varchar NOT NULL,
    "technologies_id" uuid
  );

  CREATE TABLE "affiliate_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "offer_id" uuid NOT NULL,
    "content_id" uuid,
    "channel" "enum_affiliate_events_channel" NOT NULL,
    "placement" varchar,
    "occurred_at" timestamp(3) with time zone NOT NULL
  );

  ALTER TABLE "editorial_contents_rels" ADD COLUMN "affiliate_offers_id" uuid;
  ALTER TABLE "_editorial_contents_v_rels" ADD COLUMN "affiliate_offers_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_partners_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_offers_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_events_id" uuid;
  ALTER TABLE "affiliate_offers_content_types" ADD CONSTRAINT "affiliate_offers_content_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "affiliate_offers_levels" ADD CONSTRAINT "affiliate_offers_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "affiliate_offers" ADD CONSTRAINT "affiliate_offers_partner_id_affiliate_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."affiliate_partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "affiliate_offers_rels" ADD CONSTRAINT "affiliate_offers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "affiliate_offers_rels" ADD CONSTRAINT "affiliate_offers_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "affiliate_events" ADD CONSTRAINT "affiliate_events_offer_id_affiliate_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "affiliate_events" ADD CONSTRAINT "affiliate_events_content_id_editorial_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."editorial_contents"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "affiliate_partners_name_idx" ON "affiliate_partners" USING btree ("name");
  CREATE INDEX "affiliate_partners_status_idx" ON "affiliate_partners" USING btree ("status");
  CREATE INDEX "affiliate_partners_updated_at_idx" ON "affiliate_partners" USING btree ("updated_at");
  CREATE INDEX "affiliate_partners_created_at_idx" ON "affiliate_partners" USING btree ("created_at");
  CREATE INDEX "affiliate_offers_content_types_order_idx" ON "affiliate_offers_content_types" USING btree ("order");
  CREATE INDEX "affiliate_offers_content_types_parent_idx" ON "affiliate_offers_content_types" USING btree ("parent_id");
  CREATE INDEX "affiliate_offers_levels_order_idx" ON "affiliate_offers_levels" USING btree ("order");
  CREATE INDEX "affiliate_offers_levels_parent_idx" ON "affiliate_offers_levels" USING btree ("parent_id");
  CREATE UNIQUE INDEX "affiliate_offers_slug_idx" ON "affiliate_offers" USING btree ("slug");
  CREATE INDEX "affiliate_offers_partner_idx" ON "affiliate_offers" USING btree ("partner_id");
  CREATE INDEX "affiliate_offers_resource_type_idx" ON "affiliate_offers" USING btree ("resource_type");
  CREATE INDEX "affiliate_offers_status_idx" ON "affiliate_offers" USING btree ("status");
  CREATE INDEX "affiliate_offers_updated_at_idx" ON "affiliate_offers" USING btree ("updated_at");
  CREATE INDEX "affiliate_offers_created_at_idx" ON "affiliate_offers" USING btree ("created_at");
  CREATE INDEX "affiliate_offers_rels_order_idx" ON "affiliate_offers_rels" USING btree ("order");
  CREATE INDEX "affiliate_offers_rels_parent_idx" ON "affiliate_offers_rels" USING btree ("parent_id");
  CREATE INDEX "affiliate_offers_rels_path_idx" ON "affiliate_offers_rels" USING btree ("path");
  CREATE INDEX "affiliate_offers_rels_technologies_id_idx" ON "affiliate_offers_rels" USING btree ("technologies_id");
  CREATE INDEX "affiliate_events_offer_idx" ON "affiliate_events" USING btree ("offer_id");
  CREATE INDEX "affiliate_events_content_idx" ON "affiliate_events" USING btree ("content_id");
  CREATE INDEX "affiliate_events_occurred_at_idx" ON "affiliate_events" USING btree ("occurred_at");
  ALTER TABLE "editorial_contents_rels" ADD CONSTRAINT "editorial_contents_rels_affiliate_offers_fk" FOREIGN KEY ("affiliate_offers_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_contents_v_rels" ADD CONSTRAINT "_editorial_contents_v_rels_affiliate_offers_fk" FOREIGN KEY ("affiliate_offers_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_partners_fk" FOREIGN KEY ("affiliate_partners_id") REFERENCES "public"."affiliate_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_offers_fk" FOREIGN KEY ("affiliate_offers_id") REFERENCES "public"."affiliate_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_events_fk" FOREIGN KEY ("affiliate_events_id") REFERENCES "public"."affiliate_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "editorial_contents_rels_affiliate_offers_id_idx" ON "editorial_contents_rels" USING btree ("affiliate_offers_id");
  CREATE INDEX "_editorial_contents_v_rels_affiliate_offers_id_idx" ON "_editorial_contents_v_rels" USING btree ("affiliate_offers_id");
  CREATE INDEX "payload_locked_documents_rels_affiliate_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_partners_id");
  CREATE INDEX "payload_locked_documents_rels_affiliate_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_offers_id");
  CREATE INDEX "payload_locked_documents_rels_affiliate_events_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_events_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_offers_content_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_offers_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_offers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_offers_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "affiliate_partners" CASCADE;
  DROP TABLE "affiliate_offers_content_types" CASCADE;
  DROP TABLE "affiliate_offers_levels" CASCADE;
  DROP TABLE "affiliate_offers" CASCADE;
  DROP TABLE "affiliate_offers_rels" CASCADE;
  DROP TABLE "affiliate_events" CASCADE;
  ALTER TABLE "editorial_contents_rels" DROP CONSTRAINT "editorial_contents_rels_affiliate_offers_fk";

  ALTER TABLE "_editorial_contents_v_rels" DROP CONSTRAINT "_editorial_contents_v_rels_affiliate_offers_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_partners_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_offers_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_events_fk";

  DROP INDEX "editorial_contents_rels_affiliate_offers_id_idx";
  DROP INDEX "_editorial_contents_v_rels_affiliate_offers_id_idx";
  DROP INDEX "payload_locked_documents_rels_affiliate_partners_id_idx";
  DROP INDEX "payload_locked_documents_rels_affiliate_offers_id_idx";
  DROP INDEX "payload_locked_documents_rels_affiliate_events_id_idx";
  ALTER TABLE "editorial_contents_rels" DROP COLUMN "affiliate_offers_id";
  ALTER TABLE "_editorial_contents_v_rels" DROP COLUMN "affiliate_offers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "affiliate_partners_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "affiliate_offers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "affiliate_events_id";
  DROP TYPE "public"."enum_affiliate_partners_status";
  DROP TYPE "public"."enum_affiliate_offers_content_types";
  DROP TYPE "public"."enum_affiliate_offers_levels";
  DROP TYPE "public"."enum_affiliate_offers_resource_type";
  DROP TYPE "public"."enum_affiliate_offers_selection_basis";
  DROP TYPE "public"."enum_affiliate_offers_commercial_relationship";
  DROP TYPE "public"."enum_affiliate_offers_status";
  DROP TYPE "public"."enum_affiliate_events_channel";`);
}
