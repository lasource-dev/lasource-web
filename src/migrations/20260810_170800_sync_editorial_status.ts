import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "categories"
    SET "editorial_status" = 'published'
    WHERE "_status" = 'published' AND "editorial_status" = 'draft';
    UPDATE "_categories_v"
    SET "version_editorial_status" = 'published'
    WHERE "version__status" = 'published' AND "version_editorial_status" = 'draft';

    UPDATE "sources"
    SET "editorial_status" = 'published'
    WHERE "_status" = 'published' AND "editorial_status" = 'draft';
    UPDATE "_sources_v"
    SET "version_editorial_status" = 'published'
    WHERE "version__status" = 'published' AND "version_editorial_status" = 'draft';

    UPDATE "technologies"
    SET "editorial_status" = 'published'
    WHERE "_status" = 'published' AND "editorial_status" = 'draft';
    UPDATE "_technologies_v"
    SET "version_editorial_status" = 'published'
    WHERE "version__status" = 'published' AND "version_editorial_status" = 'draft';

    UPDATE "relations"
    SET "editorial_status" = 'published'
    WHERE "_status" = 'published' AND "editorial_status" = 'draft';
    UPDATE "_relations_v"
    SET "version_editorial_status" = 'published'
    WHERE "version__status" = 'published' AND "version_editorial_status" = 'draft';

    UPDATE "editorial_contents"
    SET "editorial_status" = 'published'
    WHERE "_status" = 'published' AND "editorial_status" = 'draft';
    UPDATE "_editorial_contents_v"
    SET "version_editorial_status" = 'published'
    WHERE "version__status" = 'published' AND "version_editorial_status" = 'draft';
  `)
}

export async function down(): Promise<void> {
  // Data synchronization is intentionally irreversible.
}
