# Process de relecture — LaSource.dev

Ce document explique comment relire et valider un contenu avant sa
publication sur lasource.dev. Aucune expertise IA n'est requise — voir la
note stratégique du projet, section 5.1.

## Vue d'ensemble

```
1. Un draft est généré (par Claude, en session ou automatiquement)
        ↓
2. Une Pull Request s'ouvre sur GitHub
        ↓
3. Une URL de preview est générée automatiquement (Cloudflare Pages)
        ↓
4. TU relis sur cette URL, testes le code, coches la checklist
        ↓
5. Si corrections nécessaires : commentaire sur la PR
   (ou mention @claude directement pour que Claude corrige)
        ↓
6. Une fois validé : le contenu passe en status "published"
        ↓
7. Merge de la PR → publication automatique sur lasource.dev
```

## Étape par étape

### 1. Trouver les PR à relire

Va sur `github.com/lasource-dev/lasource-web/pulls` — chaque PR ouverte est
un contenu en attente de relecture.

### 2. Ouvrir la preview

Cloudflare poste automatiquement un commentaire sur la PR avec un lien du
type `https://<id>.lasource-web.pages.dev`. Clique dessus pour voir le
rendu réel du contenu, exactement comme il apparaîtra en production.

### 3. Suivre la checklist

Le template de PR affiche automatiquement les points à vérifier :
- Code testé dans un terminal (Python 3.10+)
- Versions à jour
- Pertinence éditoriale
- Aucune donnée inventée
- Liens fonctionnels

### 4. Tester le code

Ouvre l'onglet **Files changed** de la PR pour voir le fichier Markdown
brut. Copie le code Python dans un terminal local et exécute-le. Si une
erreur apparaît, ou si le comportement ne correspond pas à ce que le texte
décrit, laisse un commentaire directement sur la ligne concernée dans
GitHub.

### 5. Demander une correction

Deux options :

**Option A — Corriger toi-même** : édite directement le fichier via
l'interface GitHub (bouton crayon) ou en local, puis push sur la même
branche. La preview se met à jour automatiquement.

**Option B — Demander à Claude de corriger** : laisse un commentaire sur
la PR mentionnant `@claude`, en décrivant ce qui ne va pas. Exemple :

> @claude le snippet ne fonctionne pas, `create_react_agent` attend un
> paramètre `tools` obligatoire qui n'est pas dans l'exemple. Corrige.

Claude Code répond automatiquement et pousse une correction sur la même
branche.

### 6. Valider et faire passer en "published"

Une fois tout coché et le code testé avec succès, édite le frontmatter du
fichier Markdown pour changer :

```yaml
status: draft
```

en :

```yaml
status: published
```

C'est cette ligne, et uniquement elle, qui rend le contenu visible sur le
site une fois la PR mergée — même mergé, un contenu resté en `draft`
n'apparaît jamais publiquement (filet de sécurité).

### 7. Merger

Bouton **Merge pull request** en bas de la PR sur GitHub. Le site se
redéploie automatiquement en 1-2 minutes.

## Rémunération

Chaque PR mergée avec la checklist complète = un livrable validé, selon la
grille de tarification définie dans la note stratégique (section 6).
Garde une trace des PR mergées pour le suivi bimensuel des paiements.
