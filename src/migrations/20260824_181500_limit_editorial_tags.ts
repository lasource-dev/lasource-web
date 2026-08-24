import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const FIRST_TARGET_SLUG = 'premiere-page-accessible'
const SECOND_TARGET_SLUG = 'api-json-nodejs'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "editorial_contents_rels" relation
    USING "editorial_contents" content, "categories" category
    WHERE relation.parent_id = content.id
      AND relation.categories_id = category.id
      AND relation.path = 'categories'
      AND category.slug = 'developpement-web'
      AND content.slug IN (${FIRST_TARGET_SLUG}, ${SECOND_TARGET_SLUG});
  `)
  await db.execute(sql`
    DELETE FROM "_editorial_contents_v_rels" relation
    USING "_editorial_contents_v" content, "categories" category
    WHERE relation.parent_id = content.id
      AND relation.categories_id = category.id
      AND relation.path = 'categories'
      AND content.latest = true
      AND category.slug = 'developpement-web'
      AND content.version_slug IN (${FIRST_TARGET_SLUG}, ${SECOND_TARGET_SLUG});
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "editorial_contents_rels" ("order", "parent_id", "path", "categories_id")
    SELECT 0, content.id, 'categories', category.id
    FROM "editorial_contents" content
    CROSS JOIN "categories" category
    WHERE content.slug IN (${FIRST_TARGET_SLUG}, ${SECOND_TARGET_SLUG})
      AND category.slug = 'developpement-web';
  `)
  await db.execute(sql`
    INSERT INTO "_editorial_contents_v_rels" ("order", "parent_id", "path", "categories_id")
    SELECT 0, content.id, 'categories', category.id
    FROM "_editorial_contents_v" content
    CROSS JOIN "categories" category
    WHERE content.latest = true
      AND content.version_slug IN (${FIRST_TARGET_SLUG}, ${SECOND_TARGET_SLUG})
      AND category.slug = 'developpement-web';
  `)
}
