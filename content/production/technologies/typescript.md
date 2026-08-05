---
title: "TypeScript"
slug: "typescript"
description: "Une extension typée de JavaScript qui détecte des incohérences avant l’exécution et facilite la maintenance des projets."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["langages", "developpement-web"]
technologies: ["javascript", "typescript"]
tags: ["types", "outillage", "maintenance"]
sources: ["typescript-handbook", "typescript-releases"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# TypeScript

## En bref

TypeScript ajoute à JavaScript un système de types vérifié avant l’exécution. Il aide l’éditeur et le compilateur à détecter des incohérences, puis produit du JavaScript utilisable dans les navigateurs et environnements JavaScript.

TypeScript ne remplace pas JavaScript : sa syntaxe, son modèle d’exécution et ses API restent ceux de JavaScript. Il ajoute une analyse statique et des outils pour décrire les données manipulées par le programme.

## À quoi sert TypeScript ?

TypeScript devient particulièrement utile lorsque :

- plusieurs personnes travaillent sur le même code ;
- les objets métier et leurs variantes sont nombreux ;
- une bibliothèque expose une API publique ;
- les refactorisations sont fréquentes ;
- le projet doit être maintenu pendant plusieurs années ;
- l’éditeur doit guider l’utilisation de fonctions complexes.

Pour un script très court ou un apprentissage initial de JavaScript, le coût de configuration et les annotations peuvent être inutiles. Une migration peut toutefois être progressive.

## Décrire les données

```ts
type Article = { id: string; title: string; published: boolean };

function label(article: Article): string {
  return article.published ? "Publié" : "Brouillon";
}
```

Un type décrit les propriétés attendues et permet au compilateur de signaler un oubli ou une valeur incompatible. Les unions représentent plusieurs possibilités.

```ts
type Resultat =
  | { status: "success"; data: Article[] }
  | { status: "error"; message: string };
```

La propriété `status` permet ensuite à TypeScript de déterminer les autres propriétés disponibles dans chaque branche du programme.

## Inférence et annotations

TypeScript déduit souvent les types à partir des valeurs et des opérations. Il n’est pas nécessaire d’annoter chaque variable.

```ts
const total = 42; // TypeScript déduit number
const titres = articles.map((article) => article.title); // string[]
```

Ajoutez surtout des annotations aux frontières : paramètres publics, valeurs renvoyées par une API interne, configuration et objets métier. Une annotation utile exprime une intention que le compilateur ne pourrait pas déduire clairement.

## `unknown` plutôt que `any`

Les données provenant du réseau, du stockage ou d’un utilisateur ne deviennent pas fiables parce qu’un type le déclare. `any` désactive les contrôles ; `unknown` oblige à vérifier avant utilisation.

```ts
function estArticle(value: unknown): value is Article {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string"
    && typeof candidate.title === "string"
    && typeof candidate.published === "boolean";
}
```

Dans une application réelle, une bibliothèque de validation peut éviter de réécrire ces contrôles. L’important est de distinguer la vérification TypeScript, qui disparaît à la compilation, de la validation exécutée lorsque les données arrivent.

## Génériques

Les génériques décrivent une relation entre plusieurs types sans perdre l’information précise.

```ts
type Page<T> = {
  items: T[];
  total: number;
};

function premier<T>(items: T[]): T | undefined {
  return items[0];
}
```

Utilisez-les lorsqu’une fonction ou une structure conserve le type reçu. Évitez les génériques qui n’expriment aucune relation utile et compliquent seulement la lecture.

## Configuration et mode strict

Le fichier `tsconfig.json` contrôle les fichiers analysés, la cible JavaScript et les règles du compilateur. Le mode `strict` active un ensemble de vérifications qui éliminent de nombreuses ambiguïtés, notamment autour de `null`, des paramètres et des propriétés.

Sur un projet existant, activez les règles progressivement et corrigez les erreurs par zones. Ne remplacez pas systématiquement les problèmes par `any` ou des assertions : cela masque l’information que la migration devait apporter.

## Erreurs fréquentes

- croire qu’un type valide des données reçues à l’exécution ;
- annoter chaque valeur au lieu de laisser fonctionner l’inférence ;
- multiplier les assertions `as` pour faire taire le compilateur ;
- employer `any` aux frontières non fiables ;
- créer des types trop génériques qui n’expriment plus les règles métier ;
- mettre à niveau TypeScript sans lire les changements incompatibles.

## Pour commencer

1. Maîtrisez d’abord les objets, fonctions, modules et promesses en JavaScript.
2. Activez TypeScript sur un petit projet avec le mode strict.
3. Décrivez quelques objets métier avec des types et des unions.
4. Validez une réponse d’API déclarée comme `unknown`.
5. Introduisez un générique seulement lorsqu’il conserve une relation de types.

## À retenir

TypeScript rend les hypothèses du programme visibles et vérifiables avant l’exécution. Il est le plus utile lorsque les types décrivent réellement le métier et que les données extérieures restent validées à l’exécution.
