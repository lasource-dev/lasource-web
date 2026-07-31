---
title: "Node.js"
slug: "nodejs"
description: "Un environnement d’exécution JavaScript pour créer des serveurs, scripts et outils en dehors du navigateur."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["developpement-web", "backend"]
technologies: ["javascript", "nodejs"]
tags: ["serveur", "api", "outillage", "npm"]
sources: ["node-api", "node-introduction", "node-releases", "node-release-schedule"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Node.js

Node.js exécute JavaScript en dehors du navigateur. Il sert à créer des serveurs web, outils en ligne de commande et tâches automatisées.

```js
import { createServer } from "node:http";
createServer((request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ message: "Bonjour" }));
}).listen(3000);
```

Un framework peut faciliter routage, validation et erreurs, mais comprendre cette base reste précieux. Limitez les dépendances et vérifiez si l’API standard répond déjà au besoin.

Validez toute donnée réseau, ne placez jamais de secret dans le dépôt, prévoyez les erreurs et utilisez une version de Node.js encore maintenue en production.
