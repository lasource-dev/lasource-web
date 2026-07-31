---
title: "TypeScript"
slug: "typescript"
description: "Une extension typée de JavaScript qui détecte des incohérences avant l’exécution et facilite la maintenance des projets."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["langages", "developpement-web"]
technologies: ["javascript", "typescript"]
tags: ["types", "outillage", "maintenance"]
sources: ["typescript-handbook", "typescript-releases"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# TypeScript

TypeScript ajoute à JavaScript un système de types vérifié avant l’exécution. Il aide l’éditeur et le compilateur à détecter des incohérences, puis produit du JavaScript.

```ts
type Article = { id: string; title: string; published: boolean };
function label(article: Article): string {
  return article.published ? "Publié" : "Brouillon";
}
```

TypeScript déduit souvent les types : annotez surtout les frontières, paramètres publics et données métier. Pour des données externes, préférez `unknown` à `any`, puis validez réellement la structure.

Il est particulièrement utile dans une application durable, une équipe ou une bibliothèque. Consultez les notes de version avant une mise à niveau et activez progressivement le mode strict lors d’une migration.
