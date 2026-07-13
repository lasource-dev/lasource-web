# LaSource.dev — Guide pour Claude Code

Ce fichier définit les standards que Claude doit suivre en travaillant sur ce
repo, que ce soit en session interactive (terminal) ou en réponse à une
mention `@claude` dans une issue/PR GitHub.

## Contexte du projet

LaSource.dev est un éditeur technique français produisant du contenu
original (tutoriels, comparatifs, guides de migration, snippets) sur 15
frameworks IA/ML open source, distribué via un site web (Astro) et un futur
MCP Server. Voir la note stratégique du projet pour le détail complet du
positionnement et de l'architecture.

## Structure du contenu

Chaque type de contenu vit dans `src/content/<collection>/` sous forme de
fichiers Markdown avec frontmatter, validés contre les schémas Zod définis
dans `src/content.config.ts`.

Collections : `releases`, `snippets`, `migrations`, `comparatifs`,
`concepts`, `tutoriels`, `architectures`, `veille`.

## Règles de rédaction de contenu

- Toujours écrire en français, sauf le code lui-même
- Le champ `status` d'un nouveau contenu doit toujours être `draft` à la
  création — ne jamais le mettre à `published` directement
- Le champ `library` doit correspondre à une valeur de l'enum
  `libraryEnum` défini dans `src/content.config.ts` — ne jamais inventer
  une nouvelle bibliothèque sans l'ajouter d'abord à cet enum
- Ne jamais inventer de numéros de version, de benchmarks, ou de
  changements non vérifiables — si une information ne peut pas être
  confirmée depuis la documentation officielle ou le changelog du repo
  concerné, le signaler explicitement dans la PR plutôt que de l'inventer
- Le code des snippets doit être un code Python valide et complet,
  jamais un pseudo-code
- Respecter le ton éditorial existant : direct, technique, sans emphase
  marketing excessive

## Process Git

- Ne jamais committer directement sur `main`
- Une branche par contenu, nommée `draft/<slug-du-contenu>`
- Ouvrir une Pull Request avec le template fourni
  (`.github/PULL_REQUEST_TEMPLATE.md`) rempli
- Ne jamais merger une PR soi-même — la validation humaine du relecteur
  est obligatoire avant tout merge

## Ce que Claude ne doit pas faire

- Ne pas modifier `src/content.config.ts` sans que ce soit explicitement
  demandé (c'est le contrat de données du projet, tout changement impacte
  le site ET le futur MCP Server)
- Ne pas supprimer de contenu existant sans confirmation explicite
- Ne pas changer le statut d'un contenu à `published`
