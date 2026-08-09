---
title: "Obtenir une première réponse de l’API OpenAI avec Node.js"
slug: "premiere-reponse-openai-nodejs"
description: "Créer un script Node.js minimal qui appelle la Responses API sans exposer sa clé secrète."
type: "tutorial"
publication_status: "published"
review_status: "validated"
level: "beginner"
categories: ["intelligence-artificielle", "backend"]
technologies: ["openai-api", "nodejs", "javascript"]
tags: ["api", "nodejs", "responses-api", "secrets"]
sources: ["openai-api-quickstart", "openai-api-overview", "openai-models", "node-introduction"]
published_at: "2026-08-09"
reviewed_at: "2026-08-09"
reviewed_by: "Équipe LaSource.dev"
next_review_at: "2026-11-09"
---

# Obtenir une première réponse de l’API OpenAI avec Node.js

Ce tutoriel crée un script côté serveur. Il suppose une version maintenue de Node.js et une clé API créée depuis votre compte OpenAI.

## Préparer le projet

```sh
mkdir premier-appel-openai
cd premier-appel-openai
npm init -y
npm install openai
```

Ajoutez `"type": "module"` dans `package.json`, puis placez la clé dans une variable d’environnement. Ne l’écrivez ni dans le code ni dans un fichier commité.

```sh
export OPENAI_API_KEY="votre-cle"
export OPENAI_MODEL="un-modele-disponible-dans-votre-projet"
```

Consultez le catalogue officiel pour sélectionner un modèle disponible et adapté à la tâche. Garder ce choix dans une variable permet de le modifier sans réécrire le script.

## Envoyer la requête

Créez `index.js` :

```js
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
  throw new Error("OPENAI_API_KEY et OPENAI_MODEL sont requis");
}

const client = new OpenAI();

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL,
  input: "Explique en deux phrases ce qu’est une requête HTTP.",
});

console.log(response.output_text);
```

Exécutez ensuite :

```sh
node index.js
```

## Gérer un échec

Un appel réseau peut échouer ou dépasser une limite. Dans une application, interceptez l’erreur, associez-la à un identifiant de requête et renvoyez un message neutre à l’utilisateur. Ne journalisez jamais la clé ni des données sensibles.

N’ajoutez pas immédiatement des reprises automatiques autour de toutes les erreurs : certaines demandes sont invalides et certaines opérations peuvent avoir un effet. Limitez les reprises aux erreurs temporaires identifiées et imposez un nombre maximal de tentatives.

## Vérifier le résultat

Testez au moins une requête normale, une variable manquante et une entrée très longue. Le résultat du modèle n’est pas une vérité vérifiée : si l’application utilise la sortie comme donnée, validez sa forme et contrôlez son usage avant affichage ou exécution.

Vous disposez maintenant d’un appel minimal côté serveur. L’étape suivante consiste à définir un cas d’usage précis et un petit jeu d’évaluation avant d’ajouter streaming, outils ou historique de conversation.
