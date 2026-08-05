---
title: "HTML"
slug: "html"
description: "Le langage qui structure le contenu du Web et lui donne un sens compréhensible par les navigateurs et technologies d’assistance."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["langages", "developpement-web", "frontend"]
technologies: ["html"]
tags: ["semantique", "accessibilite", "web"]
sources: ["html-living-standard", "wcag-22"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-07-30"
---

# HTML

## En bref

HTML décrit la structure et le sens d’une page web. Il indique qu’un contenu est un titre, un paragraphe, une navigation, une image ou un formulaire. Le navigateur s’appuie sur cette structure pour afficher la page ; les moteurs de recherche et les technologies d’assistance l’utilisent aussi pour comprendre le contenu.

HTML n’est pas un langage de programmation. Il ne décrit ni calcul ni logique métier : il organise des informations à l’aide d’éléments comme `<main>`, `<h1>`, `<p>`, `<a>` ou `<button>`.

## À quoi sert HTML ?

HTML constitue le point de départ de tout site web. Il permet notamment de :

- structurer un article, une page produit ou une application ;
- créer des liens entre les pages ;
- intégrer des images, vidéos et contenus externes ;
- recueillir des informations avec des formulaires ;
- décrire le rôle des différentes zones de l’interface ;
- fournir une base exploitable avant même le chargement de CSS ou JavaScript.

Une page HTML bien construite reste compréhensible sans mise en forme. C’est un bon test : si la hiérarchie disparaît lorsque CSS ne charge pas, la structure mérite probablement d’être revue.

## Comment fonctionne un document HTML ?

Un document contient une déclaration de type, un élément racine `<html>`, des métadonnées dans `<head>` et le contenu visible dans `<body>`.

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Découvrir HTML</title>
  </head>
  <body><main><h1>Découvrir HTML</h1></main></body>
</html>
```

Le navigateur transforme ce document en une arborescence appelée DOM. JavaScript peut ensuite lire ou modifier cette arborescence, tandis que CSS cible ses éléments pour les présenter.

Les attributs complètent les éléments. Dans `<html lang="fr">`, `lang` indique la langue principale. Dans `<input type="email" required>`, `type` précise la donnée attendue et `required` rend le champ obligatoire.

## Les concepts essentiels

- La sémantique : choisir un élément selon son rôle, pas selon son apparence.
- La hiérarchie des titres : organiser le contenu avec un `<h1>` principal puis des sous-titres cohérents.
- Les liens et les actions : utiliser `<a>` pour naviguer et `<button>` pour déclencher une action.
- Les formulaires : associer chaque champ à un libellé avec `<label>`.
- Les alternatives textuelles : décrire les images porteuses d’information avec `alt`.
- Les landmarks : identifier les grandes zones avec `<header>`, `<nav>`, `<main>` et `<footer>`.

Les éléments natifs fournissent déjà des comportements clavier, des rôles accessibles et des conventions comprises par les navigateurs. Recréer un bouton avec un `<div>` oblige à réimplémenter ces comportements et produit souvent une interface moins robuste.

## Quand ajouter des attributs ARIA ?

ARIA complète HTML lorsque les éléments natifs ne suffisent pas, mais ne corrige pas une structure mal choisie. Un véritable `<button>` est préférable à `<div role="button">`.

Utilisez ARIA pour préciser un état ou une relation qui ne peut pas être exprimé autrement, par exemple `aria-expanded` sur le bouton qui ouvre un menu. Vérifiez ensuite le résultat au clavier et avec les outils d’accessibilité du navigateur.

## Erreurs fréquentes

- utiliser des titres uniquement pour obtenir une taille de texte ;
- placer un bouton dans un lien, ou inversement ;
- oublier le libellé visible d’un champ ;
- écrire un texte alternatif qui répète inutilement la légende ;
- employer des `<div>` pour toutes les zones de la page ;
- rendre la page dépendante de JavaScript pour afficher un contenu qui pourrait être présent dans le HTML initial.

## Pour commencer

1. Créez un document minimal avec un titre et un paragraphe.
2. Ajoutez une navigation et plusieurs sections.
3. Intégrez une image avec une alternative adaptée.
4. Construisez un formulaire avec des libellés et des messages d’erreur.
5. Parcourez toute la page au clavier avant d’ajouter CSS et JavaScript.

## À retenir

HTML donne du sens au contenu. Une structure simple, sémantique et valide facilite ensuite la mise en forme, les interactions, l’accessibilité, le référencement et la maintenance.
