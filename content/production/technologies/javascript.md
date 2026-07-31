---
title: "JavaScript"
slug: "javascript"
description: "Le langage du Web interactif, utilisé dans le navigateur, sur les serveurs et dans de nombreux outils."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["langages", "developpement-web"]
technologies: ["javascript"]
tags: ["web", "frontend", "backend", "ecmascript"]
sources: ["mdn-javascript-guide", "mdn-javascript-modules"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# JavaScript

JavaScript est le langage de programmation natif du Web. Dans un navigateur, il réagit aux actions, modifie la page et communique avec des services. Avec Node.js, il s’exécute aussi côté serveur.

```js
const technologies = ["HTML", "CSS", "JavaScript"];
const labels = technologies.map((technology) => `Apprendre ${technology}`);
```

## Notions essentielles

- `const` et `let` ;
- fonctions et portée ;
- tableaux et objets ;
- modules avec `import` et `export` ;
- promesses et `async`/`await` ;
- gestion des erreurs ;
- DOM et événements.

Pour une requête réseau, vérifiez toujours `response.ok` : `fetch` ne rejette pas automatiquement toutes les réponses HTTP en erreur.

Évitez d’apprendre un framework avant les bases du langage et d’installer une dépendance pour une opération déjà fournie par la plateforme.
