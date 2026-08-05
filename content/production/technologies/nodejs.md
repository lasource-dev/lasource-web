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

## En bref

Node.js exécute JavaScript en dehors du navigateur. Il utilise le moteur V8 et fournit des API pour le réseau, les fichiers, les processus et le système d’exploitation. Il sert à créer des serveurs web, des outils en ligne de commande et des tâches automatisées.

Node.js n’est ni un langage ni un framework. Le langage reste JavaScript ; Node.js est l’environnement qui l’exécute et lui donne accès à des capacités absentes du navigateur.

## À quoi sert Node.js ?

Node.js est couramment utilisé pour :

- créer des API HTTP et des services web ;
- exécuter des outils de compilation et de développement ;
- automatiser des traitements de fichiers ;
- construire des applications en ligne de commande ;
- traiter des flux de données ;
- partager des modules JavaScript entre plusieurs projets.

Son modèle d’entrées-sorties convient particulièrement aux applications qui attendent souvent le réseau ou le disque. Pour des calculs intensifs et longs, il faut éviter de bloquer la boucle d’événements et envisager des processus ou workers séparés.

## Un premier serveur HTTP

```js
import { createServer } from "node:http";

createServer((request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ message: "Bonjour" }));
}).listen(3000);
```

Ce serveur écoute le port 3000 et répond en JSON. Il ne gère encore ni routes, ni validation, ni journalisation, ni arrêt propre. Un framework peut fournir ces conventions, mais comprendre la primitive HTTP aide à diagnostiquer ce qu’il fait.

## La boucle d’événements

Node.js exécute généralement le code JavaScript sur un thread principal. Les opérations réseau et de fichiers peuvent progresser sans bloquer ce thread, puis leurs résultats sont traités lorsque la boucle d’événements est disponible.

Une boucle de calcul longue, une transformation synchrone volumineuse ou une lecture de fichier synchrone bloque les autres requêtes. Mesurez le travail effectué et utilisez les API asynchrones dans les chemins qui servent plusieurs utilisateurs.

## Modules et paquets

Les modules ECMAScript utilisent `import` et `export`. Le champ `type` de `package.json` et l’extension du fichier déterminent la façon dont Node.js interprète les modules.

`npm` installe les paquets et enregistre leurs versions. Le fichier de verrouillage doit être versionné pour obtenir des installations reproductibles. Avant d’ajouter une dépendance, vérifiez sa maintenance, ses permissions, son poids et l’existence d’une API standard équivalente.

## Variables d’environnement et secrets

La configuration qui varie entre les environnements peut être lue depuis `process.env`. Validez-la au démarrage et arrêtez l’application avec un message clair lorsqu’une valeur obligatoire manque.

Ne placez jamais de secret dans le dépôt, le code envoyé au navigateur ou les journaux. Utilisez le système de secrets de la plateforme d’exécution et limitez les droits de chaque identifiant.

## Gérer les erreurs

Une application doit distinguer les erreurs attendues — saisie invalide, ressource absente — des erreurs internes. Les premières produisent une réponse contrôlée ; les secondes doivent être journalisées avec le contexte nécessaire sans révéler d’informations sensibles au client.

Une promesse rejetée doit être attendue ou traitée. Prévoyez également l’arrêt : cesser d’accepter de nouvelles requêtes, terminer le travail en cours puis fermer les connexions.

## Choisir une version

Utilisez une version de Node.js encore maintenue, idéalement une version LTS adaptée à votre plateforme. Fixez la version dans le projet et dans la CI afin d’éviter des différences entre développement et production. Consultez les notes de version avant une mise à niveau majeure.

## Erreurs fréquentes

- bloquer la boucle d’événements avec du travail synchrone coûteux ;
- faire confiance aux données reçues du réseau ;
- installer une dépendance sans examiner sa maintenance ;
- mélanger configuration publique et secrets serveur ;
- ignorer les rejets de promesses ;
- lancer un serveur sans prévoir l’observabilité et l’arrêt propre.

## Pour commencer

1. Installez une version LTS et créez un projet avec `package.json`.
2. Écrivez un script qui lit et transforme un fichier.
3. Créez un serveur HTTP avec plusieurs routes simples.
4. Validez les paramètres et renvoyez les bons codes HTTP.
5. Ajoutez tests, journaux structurés et arrêt propre avant le déploiement.

## À retenir

Node.js apporte JavaScript au serveur et aux outils. Sa simplicité apparente ne dispense pas de gérer validation, erreurs, dépendances, secrets et cycle de vie du processus.
