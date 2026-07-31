---
title: "Comprendre HTTP : requêtes, réponses et codes de statut"
slug: "comprendre-http"
description: "Comprendre le protocole qui permet aux navigateurs, API et serveurs d’échanger des ressources et des informations."
type: "guide"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["developpement-web", "api"]
technologies: []
tags: ["http", "api", "reseau", "serveur"]
sources: ["rfc-9110"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-07-30"
---

# Comprendre HTTP : requêtes, réponses et codes de statut

HTTP définit les échanges entre un client et un serveur. Le client envoie une requête ; le serveur renvoie une réponse.

```http
GET /articles/42 HTTP/1.1
Host: example.test
Accept: application/json
```

Une requête contient une méthode, une cible, des en-têtes et parfois un contenu. `GET` demande une représentation, `POST` soumet des données, `PUT` remplace généralement un état et `DELETE` demande une suppression.

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":42,"title":"Comprendre HTTP"}
```

## Codes courants

- `200` : succès ;
- `201` : ressource créée ;
- `204` : succès sans contenu ;
- `400` : requête incorrecte ;
- `401` : authentification absente ou invalide ;
- `403` : accès refusé ;
- `404` : ressource introuvable ;
- `500` : erreur côté serveur.

HTTPS protège le transport avec TLS, mais ne dispense pas de valider les entrées, contrôler les autorisations et protéger les secrets.
