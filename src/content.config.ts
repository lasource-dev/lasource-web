import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Bibliothèques couvertes (section 7 de la note stratégique)
const libraryEnum = z.enum([
  'langchain',
  'transformers',
  'vllm',
  'ollama',
  'crewai',
  'llama_index',
  'llama_cpp',
  'pydantic-ai',
  'langflow',
  'dify',
  'ragflow',
  'mem0',
  'instructor',
  'autogen',
  'litellm',
]);

// Champs communs à tous les contenus
const baseFields = {
  title: z.string(),
  library: libraryEnum,
  version: z.string().optional(),
  python_min: z.string().optional(),
  tags: z.array(z.string()),
  lang: z.enum(['fr', 'en']).default('fr'),
  updated: z.date(),
};

// Schéma d'un atome MCP (section 3.3 de la note stratégique)
// Un atome = une question, une réponse, un snippet de code
const atomeSchema = z.object({
  ...baseFields,
  category: z.enum(['snippet', 'release', 'migration', 'concept', 'comparison', 'error_fix']),
  code: z.string().optional(),
  explanation: z.string(),
  gotcha: z.string().optional(),
  see_also: z.array(z.string()).optional(),
  tutorial_url: z.string().optional(), // lien retour vers le tutoriel complet
});

// Fiche Release — À chaque release (section 4)
const releases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/releases' }),
  schema: atomeSchema.extend({
    breaking_changes: z.array(z.string()).optional(),
  }),
});

// Snippet — LE produit MCP natif, 20-30/semaine en batch (section 4)
const snippets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/snippets' }),
  schema: atomeSchema,
});

// Guide migration — Checklist + snippets avant/après (section 4)
const migrations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/migrations' }),
  schema: atomeSchema.extend({
    from_version: z.string(),
    to_version: z.string(),
    checklist: z.array(z.string()).optional(),
  }),
});

// Comparatif — 2/mois, analyse détaillée + reco en 1 phrase (section 4)
const comparatifs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/comparatifs' }),
  schema: z.object({
    ...baseFields,
    libraries_compared: z.array(libraryEnum),
    recommendation: z.string(), // reco en 1 phrase pour l'atome MCP
  }),
});

// Fiche concept — 4/mois, explication pédagogique (section 4)
const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: atomeSchema,
});

// Tutoriel — Projet complet A à Z, découpé en 5-10 snippets (section 4)
const tutoriels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutoriels' }),
  schema: z.object({
    ...baseFields,
    difficulty: z.enum(['debutant', 'intermediaire', 'avance']),
    duree_lecture: z.number(), // minutes
    atomes_generes: z.array(z.string()).optional(), // refs vers snippets extraits
  }),
});

// Architecture — 1/mois, pas adapté MCP, reste sur le web (section 4)
const architectures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/architectures' }),
  schema: z.object({
    ...baseFields,
    diagramme: z.string().optional(), // chemin vers l'image/svg
  }),
});

// Bulletin veille — Hebdo, newsletter + liste à puces (section 4)
const veille = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/veille' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    news_items: z.array(
      z.object({
        titre: z.string(),
        resume: z.string(),
        lien: z.string(),
      })
    ),
  }),
});

export const collections = {
  releases,
  snippets,
  migrations,
  comparatifs,
  concepts,
  tutoriels,
  architectures,
  veille,
};
