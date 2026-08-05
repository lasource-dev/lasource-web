---
title: "JavaScript"
slug: "javascript"
description: "Le langage du Web interactif, utilisé dans le navigateur, sur les serveurs et dans de nombreux outils."
type: "technology"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["langages", "developpement-web"]
technologies: ["javascript"]
tags: ["web", "frontend", "backend", "ecmascript"]
sources: ["mdn-javascript-guide", "mdn-javascript-modules"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# JavaScript

## En bref

JavaScript est le langage de programmation natif du Web. Dans un navigateur, il réagit aux actions, modifie la page et échange des données avec des services. Il s’exécute aussi côté serveur, dans des outils en ligne de commande, des applications mobiles et de nombreux environnements embarqués.

HTML décrit le contenu, CSS le présente et JavaScript ajoute les comportements qui dépendent d’une action, d’une donnée ou d’un calcul.

## À quoi sert JavaScript ?

Dans une interface web, JavaScript permet notamment de :

- valider un formulaire et afficher des erreurs utiles ;
- ouvrir un menu, une fenêtre modale ou un panneau ;
- mettre à jour une partie de la page sans la recharger ;
- interroger une API avec HTTP ;
- enregistrer un état dans le navigateur ;
- dessiner, lire des médias ou utiliser certaines capacités de l’appareil.

Hors du navigateur, JavaScript sert à créer des serveurs avec Node.js, automatiser des tâches et partager du code entre plusieurs environnements.

## Les valeurs et les variables

JavaScript manipule des chaînes de caractères, nombres, booléens, objets, tableaux et quelques valeurs particulières comme `null` et `undefined`. Utilisez `const` par défaut et `let` lorsque la variable doit être réassignée.

```js
const technologies = ["HTML", "CSS", "JavaScript"];
const labels = technologies.map((technology) => `Apprendre ${technology}`);
```

Les objets regroupent des propriétés nommées ; les tableaux représentent des collections ordonnées. Comme les objets sont transmis par référence, une modification peut être visible depuis plusieurs endroits du programme. Préférez des transformations explicites lorsque ce partage n’est pas souhaité.

## Fonctions et modules

Une fonction regroupe un comportement et peut recevoir des paramètres puis renvoyer un résultat. Une fonction facile à tester dépend de ses arguments et limite les modifications extérieures.

```js
export function prixAvecTaxe(prix, taux) {
  if (!Number.isFinite(prix) || !Number.isFinite(taux)) {
    throw new TypeError("Le prix et le taux doivent être des nombres");
  }

  return prix * (1 + taux);
}
```

Les modules répartissent le programme entre plusieurs fichiers avec `export` et `import`. Ils rendent les dépendances visibles et évitent de placer toutes les valeurs dans l’espace global.

## Asynchronisme et requêtes réseau

Certaines opérations prennent du temps : requête HTTP, lecture d’un fichier ou temporisation. Les promesses représentent leur résultat futur ; `async` et `await` permettent de les enchaîner avec une syntaxe lisible.

```js
async function chargerArticle(id) {
  const response = await fetch(`/api/articles/${id}`);

  if (!response.ok) {
    throw new Error(`Échec HTTP : ${response.status}`);
  }

  return response.json();
}
```

`fetch` ne rejette pas automatiquement toutes les réponses HTTP en erreur. Vérifiez `response.ok` ou le code de statut, puis prévoyez ce que l’interface doit afficher si le réseau est lent ou indisponible.

## JavaScript et le DOM

Dans le navigateur, le DOM représente le document HTML. JavaScript peut sélectionner un élément, écouter un événement et modifier l’interface.

```js
const button = document.querySelector("button");
const status = document.querySelector("[role='status']");

button?.addEventListener("click", () => {
  status.textContent = "Action terminée";
});
```

Utilisez les éléments HTML selon leur rôle avant d’ajouter des gestionnaires JavaScript. Un bouton natif fonctionne déjà au clavier ; un élément générique nécessite davantage de code et de tests.

## Concepts essentiels

- `const` et `let` ;
- fonctions, fermetures et portée ;
- tableaux et objets ;
- modules avec `import` et `export` ;
- promesses et `async`/`await` ;
- gestion des erreurs ;
- DOM et événements.

## Quand utiliser une bibliothèque ou un framework ?

JavaScript sans dépendance suffit pour de nombreuses interactions locales. Une bibliothèque ou un framework devient utile lorsque l’interface comporte beaucoup d’états liés, des composants répétés, un routage complexe ou des conventions partagées par une équipe.

Apprenez d’abord les fonctions, objets, tableaux, modules, promesses et événements. Ces notions restent présentes dans React, Vue, Angular, Node.js et la plupart des outils de l’écosystème.

## Erreurs fréquentes

- ignorer les états de chargement, d’absence de données et d’erreur ;
- modifier le DOM avec `innerHTML` à partir d’une saisie non fiable ;
- confondre `null`, `undefined`, chaîne vide et valeur absente ;
- oublier qu’une opération asynchrone peut se terminer dans un ordre différent ;
- installer une dépendance pour une opération déjà fournie par la plateforme ;
- capturer une erreur sans la traiter ni la rendre observable.

## Pour commencer

1. Écrivez quelques fonctions qui transforment des chaînes, nombres et tableaux.
2. Manipulez une liste d’objets sans modifier les données d’origine.
3. Ajoutez une interaction à une page HTML existante.
4. Chargez des données depuis une API et gérez les erreurs.
5. Organisez le code en modules avant d’adopter un framework.

## À retenir

JavaScript relie les actions, les données et l’interface. Un programme robuste valide ce qu’il reçoit, rend ses erreurs visibles et utilise les capacités natives du Web avant d’ajouter de nouvelles abstractions.
