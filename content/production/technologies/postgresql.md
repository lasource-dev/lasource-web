---
title: "PostgreSQL"
slug: "postgresql"
description: "Un système de gestion de base de données relationnelle open source, conçu pour conserver et interroger des données durablement."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["backend", "developpement-web"]
technologies: ["postgresql"]
tags: ["base-de-donnees", "sql", "transactions", "serveur"]
sources: ["postgresql-documentation"]
published_at: "2026-08-05"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-02-05"
---

# PostgreSQL

## En bref

PostgreSQL est un système de gestion de base de données relationnelle open source. Il conserve des données dans des tables, applique des contraintes et permet de les interroger avec SQL.

Une base relationnelle ne sert pas seulement à stocker des lignes. Elle protège aussi des règles : identifiants uniques, relations valides, valeurs obligatoires et opérations qui doivent réussir ou échouer ensemble.

## À quoi sert PostgreSQL ?

PostgreSQL convient à de nombreux usages :

- applications web et API ;
- systèmes de gestion et outils internes ;
- catalogues, commandes et paiements ;
- recherche et analyse de données structurées ;
- données géographiques avec des extensions ;
- traitements qui exigent des transactions fiables.

Il peut stocker du JSON, mais reste principalement une base relationnelle. La structure des tables et les contraintes apportent une valeur importante lorsque les données ont des relations et des règles durables.

## Tables, lignes et colonnes

Une table décrit un ensemble d’objets de même nature. Chaque colonne possède un type ; chaque ligne représente un enregistrement.

```sql
CREATE TABLE articles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Les contraintes `NOT NULL`, `UNIQUE`, `CHECK` et `FOREIGN KEY` empêchent les états invalides au plus près des données. Elles complètent la validation de l’application ; elles ne la remplacent pas pour les messages destinés aux utilisateurs.

## Interroger avec SQL

`SELECT` choisit les colonnes et lignes à lire. Les jointures relient plusieurs tables selon leurs clés.

```sql
SELECT articles.slug, articles.title, authors.name
FROM articles
JOIN authors ON authors.id = articles.author_id
WHERE articles.published_at <= now()
ORDER BY articles.published_at DESC
LIMIT 20;
```

Écrivez d’abord une requête correcte et lisible, puis mesurez son comportement avec des données représentatives. Le plan d’exécution indique comment PostgreSQL parcourt les tables et utilise les index.

## Transactions

Une transaction regroupe plusieurs opérations dans une unité. Si l’une échoue, l’ensemble peut être annulé.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;

COMMIT;
```

Les transactions protègent la cohérence, mais doivent rester aussi courtes que possible. Une transaction ouverte pendant un appel réseau ou une interaction humaine conserve des ressources et peut bloquer d’autres opérations.

## Index

Un index accélère certaines lectures en maintenant une structure supplémentaire. Il consomme de l’espace et ralentit les écritures, car il doit rester synchronisé.

Créez les index à partir des requêtes réelles : colonnes filtrées, jointures et tris fréquents. Un index sur chaque colonne n’est ni nécessaire ni efficace. Vérifiez son utilisation avec `EXPLAIN` et surveillez les requêtes lentes.

## Concurrence et connexions

Plusieurs transactions peuvent lire et modifier les données en même temps. PostgreSQL utilise un contrôle de concurrence qui limite les blocages entre lectures et écritures, mais des conflits restent possibles.

L’application doit savoir réessayer certaines transactions et éviter les mises à jour perdues. Utilisez également un pool de connexions : ouvrir une connexion pour chaque petite opération coûte cher, mais maintenir trop de connexions surcharge le serveur.

## Sauvegardes et migrations

Une sauvegarde n’est utile que si sa restauration a été testée. Définissez la fréquence, la durée de conservation et la perte de données acceptable.

Les migrations doivent être versionnées avec le code. Sur une grande table, une modification apparemment simple peut verrouiller les écritures ou durer longtemps. Préparez les changements en plusieurs étapes compatibles lorsque le service doit rester disponible.

## Erreurs fréquentes

- compter uniquement sur la validation de l’application ;
- créer des index sans observer les requêtes ;
- construire les requêtes par concaténation au lieu de paramètres ;
- garder une transaction ouverte pendant un appel externe ;
- utiliser un compte applicatif avec des droits d’administration ;
- sauvegarder sans tester la restauration.

## Pour commencer

1. Créez quelques tables avec clés primaires, étrangères et contraintes.
2. Écrivez des requêtes avec filtres, tris, agrégations et jointures.
3. Regroupez une opération métier dans une transaction.
4. Analysez une requête avec `EXPLAIN` avant et après un index.
5. Automatisez une sauvegarde puis restaurez-la dans un environnement isolé.

## À retenir

PostgreSQL protège les données lorsque le schéma, les contraintes et les transactions expriment les règles du métier. La performance et la fiabilité viennent ensuite de mesures réelles, d’index ciblés et de procédures de sauvegarde testées.
