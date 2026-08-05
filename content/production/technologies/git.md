---
title: "Git"
slug: "git"
description: "Un système de gestion de versions distribué pour enregistrer, comparer et partager les évolutions d’un projet."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["outils"]
technologies: ["git"]
tags: ["versionnement", "collaboration", "historique"]
sources: ["git-reference", "git-releases"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Git

## En bref

Git est un système de gestion de versions distribué. Il enregistre l’évolution de fichiers, permet de comparer les changements, de revenir à un état connu et de collaborer sans écraser le travail des autres.

Git fonctionne localement : un dépôt complet contient les fichiers du projet et leur historique. GitHub, GitLab ou Bitbucket peuvent héberger ce dépôt et ajouter des fonctions de collaboration, mais ils ne remplacent pas Git.

## À quoi sert Git ?

Git permet de :

- conserver un historique compréhensible du projet ;
- travailler sur une modification sans perturber la branche principale ;
- comparer plusieurs versions d’un fichier ;
- partager et fusionner le travail de plusieurs personnes ;
- retrouver l’origine d’un changement ou d’une erreur ;
- marquer les versions livrées avec des tags.

Il est principalement utilisé pour le code, mais convient à tout ensemble de fichiers texte dont les modifications doivent être suivies.

## Les trois zones de travail

Le répertoire de travail contient les fichiers visibles. L’index rassemble ce qui entrera dans le prochain commit. Le dépôt conserve l’historique.

```sh
git status
git add README.md
git diff --cached
git commit -m "Documenter le démarrage"
```

`git status` montre l’état de ces zones. `git diff` affiche les modifications non indexées et `git diff --cached` celles qui seront incluses dans le prochain commit.

## Commits et historique

Un commit représente un état du projet accompagné d’un auteur, d’une date, d’un message et d’un lien vers son ou ses parents. Un bon commit forme une unité cohérente : il doit pouvoir être compris, testé et éventuellement annulé séparément.

Le message explique l’intention du changement, pas seulement les fichiers touchés. « Corriger la validation des adresses » est plus utile que « Modifier form.ts ».

## Branches et fusion

Une branche est un nom qui pointe vers un commit. Créer une branche est peu coûteux et permet d’isoler un travail.

```sh
git switch -c corriger-formulaire
# effectuer puis committer les changements
git switch main
git merge corriger-formulaire
```

Une fusion combine deux historiques. Si les mêmes lignes ont été modifiées différemment, Git signale un conflit et demande une décision humaine. Lisez les deux intentions avant de choisir le résultat ; ne supprimez pas simplement les marqueurs de conflit.

## Dépôts distants

Un dépôt distant est une autre copie du projet. `git fetch` récupère son historique sans modifier votre branche. `git pull` récupère puis intègre les changements. `git push` envoie vos commits.

Avant de pousser, vérifiez la branche active, relisez les commits et exécutez les contrôles du projet. Après le partage, évitez de réécrire l’historique sans coordination : les autres copies reposent peut-être déjà dessus.

## Annuler sans perdre son travail

La bonne commande dépend de ce qui a été partagé :

- `git restore` peut restaurer un fichier non committé ;
- `git revert` crée un nouveau commit qui annule un changement publié ;
- `git reset` déplace une branche et peut rendre des changements difficiles à retrouver ;
- `git reflog` aide à retrouver des commits récemment accessibles.

Avant une opération destructive, consultez `git status` et créez si nécessaire une branche de sauvegarde. Sur un historique partagé, préférez généralement `git revert`.

## Erreurs fréquentes

- ajouter des secrets, fichiers générés ou dépendances au dépôt ;
- regrouper plusieurs sujets sans rapport dans un même commit ;
- utiliser `git add .` sans relire ce qui sera indexé ;
- résoudre un conflit sans comprendre les deux versions ;
- forcer un push sur une branche partagée ;
- confondre synchronisation du dépôt et déploiement de l’application.

## Pour commencer

1. Initialisez un dépôt et observez `git status` après chaque action.
2. Créez plusieurs commits courts en consultant les différences.
3. Travaillez sur une branche puis fusionnez-la.
4. Ajoutez un dépôt distant et comparez `fetch`, `pull` et `push`.
5. Entraînez-vous à annuler un commit dans un dépôt de test.

## À retenir

Git est plus sûr lorsque chaque commande part d’un état compris. Consultez souvent `git status`, préparez des commits cohérents et traitez l’historique partagé comme un objet collectif.
