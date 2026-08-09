---
title: "Model Context Protocol"
slug: "model-context-protocol"
description: "Un standard ouvert pour connecter des applications d’IA à des outils, ressources et modèles de prompts."
type: "technology"
publication_status: "draft"
review_status: "unreviewed"
level: "intermediate"
categories: ["intelligence-artificielle"]
technologies: ["openai-api", "nodejs", "typescript"]
tags: ["mcp", "agents", "outils", "protocole"]
sources: ["mcp-introduction", "mcp-architecture"]
published_at: null
reviewed_at: null
reviewed_by: null
next_review_at: "2026-11-09"
---

# Model Context Protocol

## En bref

Model Context Protocol, ou MCP, est un standard ouvert qui permet à une application d’IA de découvrir et d’utiliser des capacités fournies par des serveurs. Il définit des échanges entre un hôte, des clients et des serveurs ; il ne définit ni le modèle de langage ni la manière dont l’application doit exploiter le contexte reçu.

## À quoi sert MCP ?

MCP évite de créer une intégration propriétaire différente pour chaque combinaison d’application et de source de données. Un serveur peut exposer une base documentaire, une API métier ou une action ; plusieurs hôtes compatibles peuvent ensuite s’y connecter selon leurs règles de sécurité.

Cette compatibilité ne garantit pas qu’un serveur fonctionne partout. Les hôtes ne prennent pas nécessairement en charge les mêmes versions, transports, primitives ou extensions.

## Architecture

L’hôte est l’application d’IA visible par l’utilisateur. Il crée un client distinct pour chaque serveur et contrôle les connexions, permissions et informations transmises. Le serveur fournit des capacités ciblées sans recevoir automatiquement l’ensemble de la conversation ni accéder aux autres serveurs.

Le protocole utilise JSON-RPC 2.0 et négocie les capacités lors de l’initialisation. La couche de données décrit les messages et primitives ; la couche de transport porte ces messages localement ou à distance.

## Outils, ressources et prompts

- un outil représente une opération exécutable, comme rechercher ou modifier une donnée ;
- une ressource fournit un contenu identifiable, comme un fichier ou un enregistrement ;
- un prompt fournit un modèle d’interaction réutilisable.

Une donnée consultable ne devrait pas devenir un outil uniquement parce qu’un modèle peut l’appeler. Le choix de la primitive exprime l’intention et influence les contrôles que l’hôte peut appliquer.

## Transports

Le transport `stdio` relie généralement un hôte à un processus local par ses entrées et sorties standard. Streamable HTTP permet des serveurs distants et peut utiliser des mécanismes d’authentification HTTP. Les journaux d’un serveur `stdio` doivent être écrits sur la sortie d’erreur afin de ne pas corrompre les messages du protocole.

## Sécurité

Un outil appelé par un modèle reste une opération initiée à partir d’une entrée non fiable. L’hôte et le serveur doivent donc appliquer leurs propres contrôles.

- accordez les permissions minimales ;
- validez chaque argument côté serveur ;
- affichez clairement les opérations sensibles avant confirmation ;
- protégez les serveurs distants avec une authentification adaptée ;
- journalisez les actions sans exposer de secrets ;
- considérez les descriptions d’outils et contenus externes comme non fiables.

## Erreurs fréquentes

- confondre MCP avec un framework d’agents ou un modèle ;
- exposer une API administrative entière sous un seul outil ;
- faire confiance aux arguments parce qu’ils viennent du modèle ;
- supposer que tous les clients prennent en charge les mêmes fonctions ;
- mélanger les journaux et les messages JSON-RPC sur la sortie standard.

## À retenir

MCP standardise la connexion entre applications d’IA et systèmes externes. Son utilité vient de l’interopérabilité ; sa sûreté dépend toujours des permissions, validations et confirmations mises en œuvre autour du protocole.
