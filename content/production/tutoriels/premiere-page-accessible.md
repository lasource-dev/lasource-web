---
title: "Créer une première page accessible et responsive"
slug: "premiere-page-accessible"
description: "Construire une page HTML et CSS lisible, adaptable et utilisable au clavier sans dépendance ni framework."
type: "tutorial"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["developpement-web", "frontend", "accessibilite"]
technologies: ["html", "css"]
tags: ["semantique", "clavier", "responsive", "wcag"]
sources: ["html-living-standard", "css-snapshot-2026", "wcag-22", "wcag-22-quickref"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Créer une première page accessible et responsive

Construisez une page qui reste lisible sur mobile et fonctionne au clavier.

```html
<a class="skip-link" href="#content">Aller au contenu</a>
<header>
  <nav aria-label="Navigation principale">
    <a href="#program">Programme</a>
    <a href="#register">Inscription</a>
  </nav>
</header>
<main id="content">
  <h1>Apprendre le Web en construisant</h1>
  <form id="register">
    <label for="email">Adresse e-mail</label>
    <input id="email" type="email" required autocomplete="email">
    <button type="submit">S’inscrire</button>
  </form>
</main>
```

```css
* { box-sizing: border-box; }
main { width: min(100% - 2rem, 70rem); margin-inline: auto; }
a:focus-visible, button:focus-visible, input:focus-visible {
  outline: .2rem solid #f0a000;
  outline-offset: .2rem;
}
.skip-link { position: absolute; transform: translateY(-150%); }
.skip-link:focus { position: fixed; transform: none; }
```

Testez sans souris, zoomez à 200 %, réduisez la fenêtre à environ 320 pixels et vérifiez que le focus reste visible. Les outils automatiques complètent mais ne remplacent pas ces tests manuels.
