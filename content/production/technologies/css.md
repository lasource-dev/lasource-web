---
title: "CSS"
slug: "css"
description: "Le langage de présentation du Web pour créer des interfaces lisibles, adaptatives et cohérentes sur différents écrans."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["langages", "developpement-web", "frontend"]
technologies: ["css", "html"]
tags: ["styles", "responsive", "mise-en-page", "accessibilite"]
sources: ["css-snapshot-2026", "wcag-22"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# CSS

## En bref

CSS contrôle la présentation d’un document : couleurs, typographie, espacements, disposition et adaptation aux écrans. HTML porte la structure et le sens ; CSS décide comment ce contenu est présenté.

Une feuille de styles est composée de règles. Chaque règle sélectionne des éléments puis leur applique des propriétés.

```css
:root {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

main {
  margin-inline: auto;
  width: min(100% - 2rem, 65ch);
}
```

## À quoi sert CSS ?

CSS permet de construire une identité visuelle et de rendre une interface utilisable dans des contextes très différents. Il sert notamment à :

- organiser les éléments en lignes, colonnes ou grilles ;
- adapter une page à la largeur disponible ;
- définir une hiérarchie visuelle cohérente ;
- indiquer les états interactifs comme le survol, le focus ou la sélection ;
- prendre en compte les préférences de mouvement, de contraste ou de thème ;
- imprimer ou afficher le même contenu sur différents supports.

CSS ne se limite donc pas à « embellir » une page. Il participe directement à sa lisibilité, à son accessibilité et à sa capacité d’adaptation.

## Comment une règle est-elle choisie ?

Plusieurs règles peuvent viser le même élément. La cascade détermine laquelle s’applique selon leur origine, leur importance, leur portée, leur spécificité et leur ordre. L’héritage transmet aussi certaines valeurs, comme la couleur ou la police, des parents vers leurs descendants.

```css
body {
  color: #202020;
}

.notice {
  color: #8a2c0d;
}
```

Ici, le texte hérite de la couleur du `<body>`, sauf dans les éléments portant la classe `notice`. Des sélecteurs simples et des règles proches du composant concerné rendent ce comportement plus facile à prévoir.

## Le modèle de boîte

Chaque élément est représenté comme une boîte composée du contenu, des marges internes, de la bordure et des marges externes. Avec `box-sizing: border-box`, la largeur déclarée inclut les marges internes et la bordure, ce qui simplifie la plupart des mises en page.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Organiser la mise en page

Flexbox est adapté aux alignements principalement organisés sur un axe : barre de navigation, groupe de boutons ou liste de cartes. Grid contrôle simultanément lignes et colonnes : grille éditoriale, tableau de bord ou mise en page générale.

Le flux normal reste souvent suffisant pour le texte. Avant d’utiliser un positionnement absolu, vérifiez si les marges, Flexbox ou Grid répondent déjà au besoin.

## Concevoir pour plusieurs écrans

Une interface adaptative part du contenu et de l’espace réellement disponible. Les unités relatives, `min()`, `max()`, `clamp()` et les requêtes de conteneur évitent de multiplier les seuils arbitraires.

```css
h1 {
  font-size: clamp(2rem, 6vw, 4.5rem);
}

.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
}
```

## Accessibilité et préférences

Ne supprimez pas l’indicateur de focus sans remplacement visible. Vérifiez les contrastes, ne transmettez pas une information uniquement par la couleur et respectez les préférences de mouvement.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto;
    transition-duration: 0.01ms;
  }
}
```

## Erreurs fréquentes

- augmenter sans cesse la spécificité pour « gagner » contre une autre règle ;
- utiliser `!important` comme solution habituelle ;
- fixer des hauteurs qui coupent le contenu agrandi ou traduit ;
- choisir des seuils uniquement à partir de modèles d’appareils ;
- masquer le débordement sans comprendre sa cause ;
- tester seulement à la souris et sur un grand écran.

## Pour commencer

1. Mettez en forme un article simple sans modifier son HTML.
2. Étudiez le modèle de boîte, la cascade et l’héritage.
3. Construisez une barre d’actions avec Flexbox.
4. Créez une grille de cartes avec Grid.
5. Testez la page au clavier, à 200 % de zoom et sur une fenêtre étroite.

## À retenir

Un CSS durable repose moins sur des astuces que sur une bonne compréhension du flux, de la cascade et des contraintes du contenu. Commencez simple, laissez le navigateur faire son travail et ajoutez des règles lorsque le besoin est réel.
