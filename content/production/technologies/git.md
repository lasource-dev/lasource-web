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

Git enregistre l’évolution de fichiers. Il permet de comparer les changements, revenir à un état connu et collaborer sans écraser le travail des autres.

Le répertoire de travail contient les fichiers visibles. L’index rassemble ce qui entrera dans le prochain commit. Le dépôt conserve l’historique.

```sh
git status
git add README.md
git diff --cached
git commit -m "Documenter le démarrage"
```

Un bon commit forme une unité cohérente et explique une intention. Git n’est pas GitHub : Git est le système de versionnement ; GitHub est une plateforme d’hébergement et de collaboration.

N’ajoutez jamais de secrets, consultez `git status` avant une opération et évitez de réécrire un historique déjà partagé sans coordination.
