---
title: "React"
slug: "react"
description: "Une bibliothèque JavaScript pour construire des interfaces à partir de composants."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "intermediate"
categories: ["developpement-web", "frontend"]
technologies: ["javascript", "react"]
tags: ["composants", "interface", "jsx", "hooks"]
sources: ["react-learn", "react-managing-state", "react-releases"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# React

## En bref

React est une bibliothèque JavaScript pour construire des interfaces à partir de composants. Un composant reçoit des données et décrit le résultat visuel attendu. React met ensuite l’écran à jour lorsque ces données changent.

React ne fournit pas à lui seul toutes les fonctions d’une application web : routage, chargement côté serveur, gestion des formulaires ou accès aux données dépendent du navigateur, de bibliothèques complémentaires ou d’un framework comme Next.js.

## À quoi sert React ?

React est adapté aux interfaces qui comportent :

- des composants visuels répétés ;
- plusieurs états qui évoluent avec les actions ;
- des listes ou tableaux interactifs ;
- des formulaires riches ;
- des zones mises à jour sans rechargement complet ;
- une équipe qui doit partager des conventions de composition.

Une page surtout éditoriale ou quelques interactions isolées n’en ont pas forcément besoin. HTML, CSS et JavaScript natif produisent souvent une solution plus légère.

## Créer un composant

```jsx
import { useState } from "react";

export default function Compteur() {
  const [compte, setCompte] = useState(0);
  return <button onClick={() => setCompte(compte + 1)}>Clics : {compte}</button>;
}
```

Le JSX ressemble à HTML mais reste une syntaxe JavaScript. Les accolades insèrent une expression et les propriétés utilisent souvent les noms du DOM JavaScript, par exemple `className`.

Un composant doit rester pur pendant son rendu : avec les mêmes propriétés et le même état, il doit produire le même résultat. Les requêtes, abonnements ou synchronisations externes n’appartiennent pas au corps du rendu.

## Propriétés et composition

Les propriétés, souvent appelées props, transmettent des informations d’un composant parent vers un enfant.

```jsx
function CarteArticle({ titre, resume, children }) {
  return (
    <article>
      <h2>{titre}</h2>
      <p>{resume}</p>
      {children}
    </article>
  );
}
```

La composition consiste à construire une interface en combinant de petits composants. Découpez selon les responsabilités et les éléments réutilisables, pas pour réduire arbitrairement le nombre de lignes.

## État et événements

L’état représente une information qui change et influence l’affichage : champ saisi, élément sélectionné ou panneau ouvert. `useState` conserve cette valeur entre les rendus.

Évitez de stocker une valeur qui peut être calculée à partir des propriétés ou d’un autre état. Deux copies de la même information finissent souvent par diverger.

Lorsque plusieurs composants doivent modifier la même donnée, placez l’état dans leur ancêtre commun le plus proche et transmettez la valeur et les fonctions nécessaires.

## Listes et identité

Pour afficher une collection, utilisez `map` et fournissez une clé stable provenant des données.

```jsx
function ListeArticles({ articles }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
```

Une clé aide React à suivre l’identité d’un élément lorsqu’il est ajouté, supprimé ou déplacé. L’index du tableau est rarement adapté à une liste modifiable.

## Effets : à utiliser avec mesure

Un effet synchronise React avec un système extérieur : abonnement, API du navigateur ou bibliothèque non React. Il ne doit pas servir à recalculer une valeur dérivable pendant le rendu ni à réagir à chaque action utilisateur.

Avant d’ajouter `useEffect`, demandez-vous si le calcul peut être effectué directement, si l’action peut rester dans le gestionnaire d’événement ou si l’état doit être restructuré.

## Accessibilité

React produit finalement du HTML. Les mêmes règles s’appliquent : éléments sémantiques, libellés de formulaires, ordre de focus et messages compréhensibles. Un composant réutilisable doit intégrer ces comportements au lieu de les laisser à chaque page.

## Erreurs fréquentes

- modifier directement un objet ou un tableau stocké dans l’état ;
- utiliser un effet pour synchroniser deux états locaux ;
- employer l’index comme clé d’une liste modifiable ;
- créer des composants génériques avant d’avoir identifié un besoin réel ;
- oublier les états de chargement, d’erreur et de liste vide ;
- adopter React avant de maîtriser les bases de JavaScript et du Web.

## Pour commencer

1. Maîtrisez fonctions, tableaux, objets, modules et promesses en JavaScript.
2. Créez des composants statiques à partir d’une maquette.
3. Transmettez les données avec des propriétés.
4. Ajoutez les interactions et placez chaque état au bon niveau.
5. Chargez des données en prévoyant les états d’attente et d’erreur.

## À retenir

React est surtout un modèle de composition et de gestion de l’état. Une interface reste plus simple lorsque les composants sont purs, les données circulent clairement et les capacités natives du Web sont conservées.
