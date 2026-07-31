---
title: "Créer une API JSON minimale avec Node.js"
slug: "api-json-nodejs"
description: "Construire une petite API sans framework pour comprendre routes, codes HTTP, JSON et validation."
type: "tutorial"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["developpement-web", "backend", "api"]
technologies: ["javascript", "nodejs"]
tags: ["http", "json", "serveur", "validation"]
sources: ["node-api", "node-releases", "rfc-9110"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Créer une API JSON minimale avec Node.js

Vous allez créer une API en mémoire qui liste des notes, afin de comprendre HTTP avant un framework.

```js
import { createServer } from "node:http";

const notes = [{ id: 1, title: "Comprendre HTTP" }];

function sendJson(response, status, data) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (request.method === "GET" && url.pathname === "/notes") {
    return sendJson(response, 200, { data: notes });
  }
  sendJson(response, 404, { error: { message: "Route introuvable" } });
});

server.listen(3000);
```

Lancez le serveur puis testez `http://localhost:3000/notes`. Pour ajouter une route `POST`, lisez le corps par morceaux, transformez-le avec `JSON.parse`, validez le titre puis répondez `201 Created`.

Utilisez `400` pour un JSON illisible et `422` pour une structure lisible mais invalide. En production, imposez une taille maximale, ajoutez authentification, journalisation et persistance.
