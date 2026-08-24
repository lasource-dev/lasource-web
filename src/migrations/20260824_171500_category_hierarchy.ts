import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const IA_PARENT_SLUG = 'intelligence-artificielle'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "categories" ADD COLUMN "parent_category_id" uuid;
  `)
  await db.execute(sql`
    ALTER TABLE "_categories_v" ADD COLUMN "version_parent_category_id" uuid;
  `)
  await db.execute(sql`
    ALTER TABLE "categories"
      ADD CONSTRAINT "categories_parent_category_id_categories_id_fk"
      FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id")
      ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    ALTER TABLE "_categories_v"
      ADD CONSTRAINT "_categories_v_version_parent_category_id_categories_id_fk"
      FOREIGN KEY ("version_parent_category_id") REFERENCES "public"."categories"("id")
      ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    CREATE INDEX "categories_parent_category_idx" ON "categories" USING btree ("parent_category_id");
  `)
  await db.execute(sql`
    CREATE INDEX "_categories_v_version_parent_category_idx" ON "_categories_v" USING btree ("version_parent_category_id");
  `)
  await db.execute(sql`
    INSERT INTO "categories" (
      "slug", "canonical_name", "short_description", "parent_category_id",
      "editorial_status", "archived", "meta_title", "meta_description", "_status"
    )
    SELECT definition.slug, definition.canonical_name, definition.short_description, parent.id,
      'published', false, definition.meta_title, definition.meta_description, 'published'
    FROM (VALUES
      ('modeles-api-ia', 'Modèles et API', 'Modèles ouverts, API propriétaires, inférence et déploiement local.', 'Modèles et API d’intelligence artificielle', 'Comparer les modèles, API et moteurs d’inférence pour construire une application IA.'),
      ('agents-ia', 'Agents IA', 'Frameworks, protocoles et outils pour créer et orchestrer des agents.', 'Agents d’intelligence artificielle', 'Technologies pour créer des agents IA, leur fournir des outils et orchestrer leurs tâches.'),
      ('rag-recherche-vectorielle', 'RAG et recherche vectorielle', 'Indexation, bases vectorielles, recherche sémantique et pipelines RAG.', 'RAG et recherche vectorielle', 'Technologies pour construire des systèmes RAG et des moteurs de recherche sémantique.'),
      ('speech-voix', 'Speech et voix', 'Transcription, reconnaissance vocale, synthèse et agents vocaux.', 'Speech, voix et transcription', 'API et modèles pour transcrire, synthétiser et traiter la voix.'),
      ('generation-images', 'Génération d’images', 'Modèles et plateformes de génération et d’édition d’images.', 'Génération d’images par IA', 'Comparer les modèles et plateformes de génération d’images par intelligence artificielle.'),
      ('observabilite-evaluation-ia', 'Observabilité et évaluation', 'Traçage, évaluation et supervision des applications fondées sur les LLM.', 'Observabilité et évaluation des LLM', 'Outils pour tracer, évaluer et superviser les applications utilisant des modèles de langage.'),
      ('donnees-machine-learning', 'Données et Machine Learning', 'Datasets, préparation des données et bibliothèques de Machine Learning.', 'Données et Machine Learning', 'Outils pour préparer, publier et exploiter des données dans les projets de Machine Learning.')
    ) AS definition(slug, canonical_name, short_description, meta_title, meta_description)
    CROSS JOIN "categories" parent
    WHERE parent.slug = ${IA_PARENT_SLUG}
    ON CONFLICT ("slug") DO UPDATE SET
      "parent_category_id" = EXCLUDED."parent_category_id",
      "updated_at" = now();
  `)
  await db.execute(sql`
    UPDATE "technologies" technology
    SET "category_id" = category.id, "updated_at" = now()
    FROM "categories" category
    WHERE category.slug = CASE
      WHEN technology.slug IN (
        'replicate', 'qwen', 'gemma', 'mistral-modeles-ouverts', 'llama', 'api-mistral',
        'api-gemini-google', 'api-claude-anthropic', 'vercel-ai-sdk', 'vllm',
        'hugging-face-hub', 'llama-cpp', 'ollama', 'litellm', 'openai-api',
        'hugging-face-transformers'
      ) THEN 'modeles-api-ia'
      WHEN technology.slug IN (
        'fastmcp', 'mastra', 'agno', 'semantic-kernel', 'microsoft-agent-framework',
        'autogen', 'pydantic-ai', 'crewai', 'langgraph', 'model-context-protocol'
      ) THEN 'agents-ia'
      WHEN technology.slug IN (
        'weaviate', 'qdrant', 'pinecone', 'pgvector', 'dspy', 'haystack', 'mem0',
        'ragflow', 'langflow', 'dify', 'faiss', 'chromadb', 'llamaindex', 'lcel', 'langchain'
      ) THEN 'rag-recherche-vectorielle'
      WHEN technology.slug IN ('cartesia', 'whisper', 'elevenlabs', 'assemblyai', 'deepgram')
        THEN 'speech-voix'
      WHEN technology.slug IN ('midjourney', 'stable-diffusion', 'dall-e', 'flux')
        THEN 'generation-images'
      WHEN technology.slug IN (
        'langfuse', 'arize-phoenix', 'weights-and-biases', 'deepeval', 'ragas', 'langsmith'
      ) THEN 'observabilite-evaluation-ia'
      WHEN technology.slug IN ('hugging-face-datasets') THEN 'donnees-machine-learning'
    END
    AND technology.slug IN (
      'replicate', 'qwen', 'gemma', 'mistral-modeles-ouverts', 'llama', 'api-mistral',
      'api-gemini-google', 'api-claude-anthropic', 'vercel-ai-sdk', 'vllm',
      'hugging-face-hub', 'llama-cpp', 'ollama', 'litellm', 'openai-api',
      'hugging-face-transformers', 'fastmcp', 'mastra', 'agno', 'semantic-kernel',
      'microsoft-agent-framework', 'autogen', 'pydantic-ai', 'crewai', 'langgraph',
      'model-context-protocol', 'weaviate', 'qdrant', 'pinecone', 'pgvector', 'dspy',
      'haystack', 'mem0', 'ragflow', 'langflow', 'dify', 'faiss', 'chromadb',
      'llamaindex', 'lcel', 'langchain', 'cartesia', 'whisper', 'elevenlabs',
      'assemblyai', 'deepgram', 'midjourney', 'stable-diffusion', 'dall-e', 'flux',
      'langfuse', 'arize-phoenix', 'weights-and-biases', 'deepeval', 'ragas',
      'langsmith', 'hugging-face-datasets'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "technologies" technology
    SET "category_id" = parent.id, "updated_at" = now()
    FROM "categories" child
    CROSS JOIN "categories" parent
    WHERE technology.category_id = child.id
      AND child.parent_category_id = parent.id
      AND parent.slug = ${IA_PARENT_SLUG};
  `)
  await db.execute(sql`
    DELETE FROM "categories" WHERE "parent_category_id" = (
      SELECT id FROM "categories" WHERE slug = ${IA_PARENT_SLUG}
    );
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "_categories_v_version_parent_category_idx";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "categories_parent_category_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "_categories_v" DROP CONSTRAINT IF EXISTS "_categories_v_version_parent_category_id_categories_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parent_category_id_categories_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "_categories_v" DROP COLUMN IF EXISTS "version_parent_category_id";
  `)
  await db.execute(sql`
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "parent_category_id";
  `)
}
