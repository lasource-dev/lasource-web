---
title: "Développement back-end"
slug: "backend"
description: "Découvrir la partie serveur d’une application : règles métier, données, API, sécurité et fiabilité."
type: "category"
publication_status: "published"
review_status: "unreviewed"
level: "all"
categories: ["developpement-web"]
technologies: ["nodejs", "javascript", "typescript"]
tags: ["serveur", "api", "base-de-donnees", "securite"]
sources: ["node-introduction", "rfc-9110"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Développement back-end

Le back-end s’exécute côté serveur. Il reçoit des demandes, applique les règles métier, lit ou modifie des données, puis renvoie une réponse.

## Les briques essentielles

- un serveur HTTP ;
- une API ;
- une couche métier ;
- une base de données ;
- authentification, autorisation et journalisation.

Un serveur utile valide les données reçues, utilise les bons codes HTTP, ne révèle pas d’informations sensibles et produit des erreurs exploitables.

## Parcours conseillé

1. Comprendre requêtes, réponses et codes HTTP.
2. Créer un serveur qui renvoie du JSON.
3. Concevoir quelques routes cohérentes.
4. Ajouter validation et gestion des erreurs.
5. Connecter une base de données et tester les comportements importants.
