import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_gpu_prices_source" AS ENUM('azure', 'runpod', 'vast');
    CREATE TYPE "public"."enum_gpu_prices_pricing_type" AS ENUM('on-demand', 'spot', 'reserved');
    CREATE TABLE "gpu_prices" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "external_key" varchar NOT NULL,
      "source" "enum_gpu_prices_source" NOT NULL,
      "provider" varchar NOT NULL,
      "provider_sku" varchar NOT NULL,
      "gpu_model" varchar NOT NULL,
      "gpu_count" numeric NOT NULL,
      "vram_gb" numeric,
      "region" varchar NOT NULL,
      "pricing_type" "enum_gpu_prices_pricing_type" NOT NULL,
      "price_per_gpu_hour_usd" numeric NOT NULL,
      "total_hourly_usd" numeric NOT NULL,
      "available" boolean DEFAULT true NOT NULL,
      "source_url" varchar NOT NULL,
      "observed_at" timestamp(3) with time zone NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gpu_prices_id" uuid;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gpu_prices_fk" FOREIGN KEY ("gpu_prices_id") REFERENCES "public"."gpu_prices"("id") ON DELETE cascade ON UPDATE no action;
    CREATE UNIQUE INDEX "gpu_prices_external_key_idx" ON "gpu_prices" USING btree ("external_key");
    CREATE INDEX "gpu_prices_source_idx" ON "gpu_prices" USING btree ("source");
    CREATE INDEX "gpu_prices_provider_idx" ON "gpu_prices" USING btree ("provider");
    CREATE INDEX "gpu_prices_gpu_model_idx" ON "gpu_prices" USING btree ("gpu_model");
    CREATE INDEX "gpu_prices_region_idx" ON "gpu_prices" USING btree ("region");
    CREATE INDEX "gpu_prices_pricing_type_idx" ON "gpu_prices" USING btree ("pricing_type");
    CREATE INDEX "gpu_prices_observed_at_idx" ON "gpu_prices" USING btree ("observed_at");
    CREATE INDEX "gpu_prices_expires_at_idx" ON "gpu_prices" USING btree ("expires_at");
    CREATE INDEX "gpu_prices_updated_at_idx" ON "gpu_prices" USING btree ("updated_at");
    CREATE INDEX "gpu_prices_created_at_idx" ON "gpu_prices" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_gpu_prices_id_idx" ON "payload_locked_documents_rels" USING btree ("gpu_prices_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gpu_prices_fk";
    DROP INDEX "payload_locked_documents_rels_gpu_prices_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gpu_prices_id";
    DROP TABLE "gpu_prices" CASCADE;
    DROP TYPE "public"."enum_gpu_prices_source";
    DROP TYPE "public"."enum_gpu_prices_pricing_type";
  `)
}
