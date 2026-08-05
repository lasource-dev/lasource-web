---
title: "Next.js"
slug: "next-js"
description: "Un framework React pour construire des applications web avec routage, rendu serveur et outils de production intégrés."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["frontend", "developpement-web"]
technologies: ["react", "javascript", "typescript", "nodejs"]
tags: ["react", "framework", "routage", "rendu-serveur"]
sources: ["nextjs-documentation"]
published_at: "2026-08-05"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-02-05"
---

# Next.js

## En bref

Next.js est un framework construit autour de React. Il ajoute une organisation de projet, un routeur, plusieurs stratégies de rendu, des optimisations et un processus de production cohérent.

React décrit les composants d’interface ; Next.js prend en charge une partie de l’application qui les entoure : navigation entre les pages, exécution sur le serveur, chargement des données, gestion des métadonnées et création du build.

## À quoi sert Next.js ?

Next.js est adapté aux applications React qui ont besoin de :

- plusieurs pages accessibles par URL ;
- contenu rendu sur le serveur ou généré à l’avance ;
- métadonnées propres à chaque page ;
- code exécuté uniquement côté serveur ;
- chargement et optimisation des images ou des polices ;
- endpoints HTTP proches de l’interface ;
- conventions partagées pour construire et déployer le projet.

Une petite interface entièrement locale n’a pas nécessairement besoin d’un framework complet. Le coût d’apprentissage et les contraintes de déploiement doivent correspondre au besoin.

## Routage par fichiers

Avec l’App Router, les dossiers placés dans `app` définissent les segments d’URL. Un fichier `page.tsx` rend une page et `layout.tsx` partage une structure entre plusieurs routes.

```tsx
// app/articles/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <h1>Article : {slug}</h1>;
}
```

Les segments dynamiques représentent des valeurs variables comme un identifiant ou un slug. Une route doit aussi prévoir l’absence de ressource et renvoyer un véritable statut 404.

## Composants serveur et composants client

Dans l’App Router, les composants sont exécutés côté serveur par défaut. Ils peuvent charger des données et utiliser des secrets sans envoyer leur code JavaScript au navigateur.

Un composant qui utilise un état local, un événement ou une API du navigateur doit déclarer `"use client"`. Cette frontière n’indique pas que tout le rendu se fera exclusivement dans le navigateur ; elle marque surtout le code et les propriétés qui doivent pouvoir y être transférés.

Placez la frontière client aussi bas que possible. Une page entière déclarée côté client envoie souvent plus de JavaScript que nécessaire et empêche certains accès directs au serveur.

## Charger et mettre en cache les données

Un composant serveur peut attendre directement une requête ou un accès à la base de données. Le comportement de cache et de régénération doit être choisi en fonction de la fraîcheur attendue.

Une page de documentation peut être générée puis régénérée périodiquement. Un tableau de bord personnel doit généralement charger des données à chaque requête. Rendez cette décision explicite : un cache implicite mal compris produit des informations anciennes ou une charge serveur inutile.

## Mutations et endpoints

Les Route Handlers exposent des endpoints HTTP dans `app`. Les Server Actions peuvent traiter certaines mutations déclenchées depuis l’interface. Dans les deux cas, validez les données et contrôlez l’autorisation sur le serveur : masquer un bouton ne protège pas une opération.

Ne placez pas toute la logique métier dans les composants. Des fonctions indépendantes facilitent les tests et peuvent être réutilisées depuis une route, une action ou une tâche en arrière-plan.

## Déploiement

Une application Next.js peut nécessiter un serveur Node.js, une plateforme compatible ou un export statique selon les fonctions utilisées. Vérifiez tôt la compatibilité de l’hébergement avec le rendu, le cache, les images et les tâches attendues.

Les variables préfixées par `NEXT_PUBLIC_` peuvent être intégrées au code envoyé au navigateur. Elles ne doivent jamais contenir de secret.

## Erreurs fréquentes

- transformer toute l’application en composants client ;
- utiliser un cache sans définir le besoin de fraîcheur ;
- accéder à une base de données depuis du code destiné au navigateur ;
- confondre rendu serveur et contrôle d’autorisation ;
- multiplier les endpoints internes sans séparer la logique métier ;
- choisir Next.js uniquement parce que le projet utilise React.

## Pour commencer

1. Maîtrisez les composants, propriétés et états en React.
2. Créez quelques routes statiques et un layout commun.
3. Ajoutez une route dynamique qui charge une ressource.
4. Identifiez clairement les frontières serveur et client.
5. Testez le build et le déploiement sur l’environnement cible.

## À retenir

Next.js fournit un cadre complet pour les applications React rendues sur le serveur ou composées de nombreuses routes. Il reste efficace lorsque les choix de rendu, de cache et d’exécution sont compris plutôt que laissés aux valeurs par défaut.
