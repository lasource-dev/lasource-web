---
title: "API OpenAI"
slug: "openai-api"
description: "Une API hébergée pour intégrer des modèles multimodaux, du raisonnement et des outils dans des applications."
type: "technology"
publication_status: "published"
review_status: "validated"
level: "intermediate"
categories: ["intelligence-artificielle"]
technologies: ["nodejs", "javascript", "typescript", "model-context-protocol"]
tags: ["ia-generative", "api", "modeles", "agents"]
sources: ["openai-api-overview", "openai-api-quickstart", "openai-models"]
published_at: "2026-08-09"
reviewed_at: "2026-08-09"
reviewed_by: "Équipe LaSource.dev"
next_review_at: "2026-11-09"
---

# API OpenAI

## En bref

L’API OpenAI donne accès à des modèles hébergés depuis une application serveur. Elle peut traiter plusieurs modalités, produire du texte ou des données structurées et utiliser des outils lorsque le modèle et l’endpoint choisis le permettent.

L’application reste responsable de l’authentification, des autorisations, des données transmises, de la validation des sorties et des actions finalement exécutées.

## À quoi sert l’API OpenAI ?

Elle convient notamment à la génération et la transformation de texte, l’analyse de documents, l’extraction structurée, l’assistance au code et les workflows où un modèle sélectionne des outils. Elle évite d’héberger soi-même les poids et l’infrastructure d’inférence.

Une API distante implique toutefois une dépendance réseau, un coût variable et des règles de traitement des données à examiner. Elle n’est pas automatiquement adaptée aux traitements hors ligne, aux contraintes de souveraineté particulières ou aux charges qui exigent un contrôle complet de l’infrastructure.

## Responses API

La Responses API est l’interface recommandée pour les nouveaux workflows de raisonnement, d’outils et de conversations en plusieurs étapes. Une réponse possède un identifiant et peut contenir plusieurs éléments de sortie ; utilisez les propriétés prévues par le SDK plutôt que de supposer une structure textuelle unique.

```ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL,
  input: "Résume ce changement en trois points factuels.",
});

console.log(response.output_text);
```

La clé doit rester côté serveur. Une variable exposée au navigateur ou enregistrée dans le dépôt compromet le compte et permet des appels non autorisés.

## Choisir un modèle

Le modèle doit être choisi à partir d’évaluations représentatives, pas uniquement de sa place dans un catalogue. Comparez au minimum qualité, latence, coût, modalités, taille de contexte et outils nécessaires. Utilisez un alias lorsque vous acceptez les évolutions du modèle ; utilisez un snapshot lorsque la stabilité du comportement prime.

## Construire une intégration fiable

- bornez la taille des entrées et des sorties ;
- validez les données structurées avant de les utiliser ;
- prévoyez délais d’attente, annulation et reprises limitées ;
- journalisez les identifiants de requête sans enregistrer de secrets ;
- testez les refus, sorties incomplètes et indisponibilités ;
- demandez une confirmation avant toute action sensible ou irréversible.

Le texte produit par un modèle reste une donnée non fiable. Il doit être échappé avant affichage dans du HTML et ne doit pas être exécuté comme du code ou une requête sans contrôle.

## Erreurs fréquentes

- appeler l’API directement depuis le navigateur avec une clé secrète ;
- figer un nom de modèle sans stratégie de mise à jour ;
- confondre réponse plausible et information vérifiée ;
- relancer toutes les erreurs sans limite ;
- donner à un outil plus de permissions que la tâche ne l’exige ;
- mettre en production sans jeu d’évaluation ni suivi des coûts.

## À retenir

L’API OpenAI accélère l’intégration de capacités d’IA hébergées. La qualité d’une application dépend cependant autant de ses évaluations, de ses garde-fous et de ses permissions que du modèle choisi.
