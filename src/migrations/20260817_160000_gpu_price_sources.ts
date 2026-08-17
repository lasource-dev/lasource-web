import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_gpu_prices_source" ADD VALUE IF NOT EXISTS 'google-cloud';
    ALTER TYPE "public"."enum_gpu_prices_source" ADD VALUE IF NOT EXISTS 'scaleway';
  `)
}

export async function down(): Promise<void> {
  // PostgreSQL cannot safely remove enum values while rows may reference them.
}
