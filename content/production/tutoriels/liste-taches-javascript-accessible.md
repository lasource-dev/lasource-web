---
title: "Construire une liste de tâches accessible en JavaScript"
slug: "liste-taches-javascript-accessible"
description: "Créer une petite application utilisable au clavier, persistante et sans framework."
type: "tutorial"
publication_status: "published"
review_status: "unreviewed"
level: "beginner"
categories: ["developpement-web", "frontend"]
technologies: ["html", "css", "javascript"]
tags: ["dom", "accessibilite", "localstorage", "formulaire"]
sources: ["html-living-standard", "mdn-javascript-guide", "wcag-22"]
published_at: "2026-07-30"
reviewed_at: null
reviewed_by: null
next_review_at: "2027-01-30"
---

# Construire une liste de tâches accessible en JavaScript

Cette application ajoute, termine et supprime des tâches. Les données restent disponibles après rechargement.

## Structure HTML

```html
<form id="task-form">
  <label for="task-title">Nouvelle tâche</label>
  <input id="task-title" required autocomplete="off">
  <button type="submit">Ajouter</button>
</form>
<p id="feedback" role="status" aria-live="polite"></p>
<ul id="task-list"></ul>
```

Le formulaire fonctionne au clavier. La zone `role="status"` annonce les confirmations sans déplacer le focus.

## État et sauvegarde

```js
let tasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  tasks.push({ id: crypto.randomUUID(), title, done: false });
  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});
```

Créez les éléments avec `document.createElement` et affectez le texte avec `textContent`, plutôt que d’injecter la saisie avec `innerHTML`.

Testez l’ajout avec Entrée, la navigation uniquement au clavier, la persistance après rechargement et un titre contenant des balises HTML.
