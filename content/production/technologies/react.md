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

React est une bibliothèque pour construire des interfaces à partir de composants : des fonctions qui reçoivent des données et décrivent un résultat visuel.

```jsx
import { useState } from "react";
export default function Compteur() {
  const [compte, setCompte] = useState(0);
  return <button onClick={() => setCompte(compte + 1)}>Clics : {compte}</button>;
}
```

React devient pertinent pour une interface riche en interactions, des composants répétés et de nombreux états. Une page surtout éditoriale n’en a pas forcément besoin.

Gardez les composants purs, évitez de dupliquer un état calculable et placez l’état au niveau le plus proche des composants qui l’utilisent. Maîtrisez d’abord fonctions, tableaux, objets, modules et promesses en JavaScript.
