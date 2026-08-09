---
title: "Intelligence artificielle"
slug: "intelligence-artificielle"
description: "Comprendre les modèles, API, bibliothèques et protocoles utilisés pour construire des applications fondées sur l’intelligence artificielle."
type: "category"
publication_status: "published"
review_status: "validated"
level: "all"
categories: ["intelligence-artificielle"]
technologies: ["openai-api", "hugging-face-transformers", "model-context-protocol"]
tags: ["ia", "modeles", "agents", "inference"]
sources: ["openai-api-overview", "huggingface-transformers", "mcp-introduction"]
published_at: "2026-08-09"
reviewed_at: "2026-08-09"
reviewed_by: "Équipe LaSource.dev"
next_review_at: "2027-02-09"
---

# Intelligence artificielle

Cette catégorie rassemble les technologies qui permettent d’intégrer des modèles d’intelligence artificielle à une application, d’exécuter des modèles préentraînés ou de connecter un assistant à des données et des actions.

## Trois couches à distinguer

- les modèles produisent une sortie à partir d’entrées comme du texte, des images ou de l’audio ;
- les API et bibliothèques permettent de charger ou d’appeler ces modèles ;
- les protocoles décrivent comment une application échange du contexte et des actions avec d’autres systèmes.

Ces couches peuvent être combinées sans être confondues. Une API hébergée évite de gérer l’infrastructure d’inférence. Une bibliothèque locale donne davantage de contrôle, mais demande des ressources matérielles et une exploitation adaptée. Un protocole d’intégration ne remplace ni le modèle ni son hébergement.

## Parcours conseillé

1. Identifier la tâche et définir comment sa qualité sera évaluée.
2. Choisir entre un service hébergé et un modèle exécuté sous votre contrôle.
3. Prototyper avec des données non sensibles.
4. Mesurer qualité, latence et coût sur des cas représentatifs.
5. Ajouter validation, sécurité, observabilité et stratégie de repli avant la production.
