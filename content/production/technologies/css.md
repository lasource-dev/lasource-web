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

CSS contrôle la présentation : couleurs, typographie, espacements, grilles et adaptation aux écrans. HTML porte le sens ; CSS décide comment ce contenu est présenté.

```css
:root { font-family: system-ui, sans-serif; line-height: 1.6; }
main { width: min(100% - 2rem, 65ch); margin-inline: auto; }
```

La cascade choisit la règle appliquée selon l’origine, la portée, la spécificité et l’ordre. Préférez des sélecteurs simples. Flexbox organise surtout selon un axe ; Grid contrôle lignes et colonnes.

Ne supprimez pas l’indicateur de focus sans remplacement visible. Vérifiez les contrastes, respectez `prefers-reduced-motion` et ne dépendez pas uniquement de la couleur.

## À apprendre

- modèle de boîte ;
- cascade et héritage ;
- unités relatives ;
- Flexbox et Grid ;
- responsive design ;
- propriétés personnalisées.
