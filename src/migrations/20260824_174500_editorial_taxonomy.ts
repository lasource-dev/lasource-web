import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const IA_PARENT_SLUG = 'intelligence-artificielle'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "categories"
    SET "canonical_name" = CASE "slug"
      WHEN 'accessibilite' THEN 'Accessibilité'
      WHEN 'api' THEN 'API'
      WHEN 'developpement-web' THEN 'Développement web'
      WHEN 'langages' THEN 'Langages'
      WHEN 'outils' THEN 'Outils'
      WHEN 'pratiques' THEN 'Pratiques'
      ELSE "canonical_name"
    END,
    "updated_at" = now()
    WHERE "slug" IN ('accessibilite', 'api', 'developpement-web', 'langages', 'outils', 'pratiques');
  `)

  await db.execute(sql`
    INSERT INTO "categories" (
      "slug", "canonical_name", "short_description", "parent_category_id",
      "editorial_status", "archived", "meta_title", "meta_description", "_status"
    )
    SELECT definition.slug, definition.canonical_name, definition.short_description, parent.id,
      'published', false, definition.meta_title, definition.meta_description, 'published'
    FROM (VALUES
      ('rgpd-gouvernance-ia', 'RGPD et gouvernance', 'Conformité, résidence des données et gouvernance des usages de l’IA.', 'RGPD et gouvernance de l’intelligence artificielle', 'Comprendre la conformité, la résidence des données et la gouvernance des applications IA.'),
      ('securite-ia', 'Sécurité IA', 'Protection des applications IA, de leurs données, outils et dépendances.', 'Sécurité des applications IA', 'Sécuriser les applications IA contre les injections, les fuites de données et les dépendances compromises.')
    ) AS definition(slug, canonical_name, short_description, meta_title, meta_description)
    CROSS JOIN "categories" parent
    WHERE parent.slug = ${IA_PARENT_SLUG}
    ON CONFLICT ("slug") DO UPDATE SET
      "parent_category_id" = EXCLUDED."parent_category_id",
      "canonical_name" = EXCLUDED."canonical_name",
      "short_description" = EXCLUDED."short_description",
      "updated_at" = now();
  `)

  await db.execute(sql`
    UPDATE "editorial_contents_rels" relation
    SET "categories_id" = target.id
    FROM "editorial_contents" content
    CROSS JOIN "categories" target
    WHERE relation.parent_id = content.id
      AND relation.path = 'categories'
      AND relation.categories_id = (SELECT id FROM "categories" WHERE slug = ${IA_PARENT_SLUG})
      AND target.slug = CASE
        WHEN content.slug IN (
          'deployer-ia-conforme-rgpd',
          'residence-donnees-llm-qui-heberge-ou',
          'ia-generative-rgpd-developpeurs'
        ) THEN 'rgpd-gouvernance-ia'
        WHEN content.slug ~ '(securite|securiser|prompt-injection)' THEN 'securite-ia'
        WHEN content.slug ~ '(voice-agent|whisper|stt-francais|tts-|elevenlabs|transcrire-audio)' THEN 'speech-voix'
        WHEN content.slug ~ '(generation-images|generer-images|flux-dall-e|deployer-flux)' THEN 'generation-images'
        WHEN content.slug ~ '(observabilite|instrumenter-traces|tracer-application|evaluer-|evaluation|hallucinations|jeu-tests)' THEN 'observabilite-evaluation-ia'
        WHEN content.slug ~ '(dataset|donnees-textuelles|web-scraping)' THEN 'donnees-machine-learning'
        WHEN content.slug ~ '(rag|recherche-semantique|embeddings|vectorielle|qdrant|weaviate|pgvector|chunking|graphrag|hybrid-search|retriever)' THEN 'rag-recherche-vectorielle'
        WHEN content.slug ~ '(agent|mcp|function-calling|tool-use|langgraph|autogen|semantic-kernel|mastra|agno|crewai|mem0|human-in-the-loop)' THEN 'agents-ia'
        ELSE 'modeles-api-ia'
      END;
  `)

  await db.execute(sql`
    UPDATE "_editorial_contents_v_rels" relation
    SET "categories_id" = target.id
    FROM "_editorial_contents_v" content
    CROSS JOIN "categories" target
    WHERE relation.parent_id = content.id
      AND relation.path = 'categories'
      AND content.latest = true
      AND relation.categories_id = (SELECT id FROM "categories" WHERE slug = ${IA_PARENT_SLUG})
      AND target.slug = CASE
        WHEN content.version_slug IN (
          'deployer-ia-conforme-rgpd',
          'residence-donnees-llm-qui-heberge-ou',
          'ia-generative-rgpd-developpeurs'
        ) THEN 'rgpd-gouvernance-ia'
        WHEN content.version_slug ~ '(securite|securiser|prompt-injection)' THEN 'securite-ia'
        WHEN content.version_slug ~ '(voice-agent|whisper|stt-francais|tts-|elevenlabs|transcrire-audio)' THEN 'speech-voix'
        WHEN content.version_slug ~ '(generation-images|generer-images|flux-dall-e|deployer-flux)' THEN 'generation-images'
        WHEN content.version_slug ~ '(observabilite|instrumenter-traces|tracer-application|evaluer-|evaluation|hallucinations|jeu-tests)' THEN 'observabilite-evaluation-ia'
        WHEN content.version_slug ~ '(dataset|donnees-textuelles|web-scraping)' THEN 'donnees-machine-learning'
        WHEN content.version_slug ~ '(rag|recherche-semantique|embeddings|vectorielle|qdrant|weaviate|pgvector|chunking|graphrag|hybrid-search|retriever)' THEN 'rag-recherche-vectorielle'
        WHEN content.version_slug ~ '(agent|mcp|function-calling|tool-use|langgraph|autogen|semantic-kernel|mastra|agno|crewai|mem0|human-in-the-loop)' THEN 'agents-ia'
        ELSE 'modeles-api-ia'
      END;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "editorial_contents_rels" relation
    SET "categories_id" = parent.id
    FROM "categories" child
    CROSS JOIN "categories" parent
    WHERE relation.categories_id = child.id
      AND child.parent_category_id = parent.id
      AND parent.slug = ${IA_PARENT_SLUG};
  `)
  await db.execute(sql`
    UPDATE "_editorial_contents_v_rels" relation
    SET "categories_id" = parent.id
    FROM "categories" child
    CROSS JOIN "categories" parent
    WHERE relation.categories_id = child.id
      AND child.parent_category_id = parent.id
      AND parent.slug = ${IA_PARENT_SLUG}
      AND relation.parent_id IN (SELECT id FROM "_editorial_contents_v" WHERE latest = true);
  `)
  await db.execute(sql`
    DELETE FROM "categories" WHERE "slug" IN ('rgpd-gouvernance-ia', 'securite-ia');
  `)
  await db.execute(sql`
    UPDATE "categories"
    SET "canonical_name" = "slug", "updated_at" = now()
    WHERE "slug" IN ('accessibilite', 'api', 'langages', 'outils', 'pratiques');
  `)
  await db.execute(sql`
    UPDATE "categories"
    SET "canonical_name" = 'developpement web', "updated_at" = now()
    WHERE "slug" = 'developpement-web';
  `)
}
