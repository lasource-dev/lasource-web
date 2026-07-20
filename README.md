# LaSource.dev

Fondation technique de LaSource.dev basée sur Next.js, Payload CMS, PostgreSQL
et TypeScript strict. Aucun modèle de contenu métier n'est encore défini.

## Prérequis

- Node.js 20.9 ou version ultérieure (Node.js 22 recommandé)
- npm 10 ou version ultérieure
- PostgreSQL 15 ou version ultérieure

## Installation

```bash
git clone https://github.com/lasource-dev/lasource-web.git
cd lasource-web
npm ci
cp .env.example .env
```

Créez une base PostgreSQL nommée `lasource`, puis adaptez `DATABASE_URI` dans
`.env`. Remplacez également `PAYLOAD_SECRET` par une valeur aléatoire :

```bash
openssl rand -base64 32
```

Démarrez ensuite l'application :

```bash
npm run dev
```

- site public : <http://localhost:3000>
- administration Payload : <http://localhost:3000/admin>

Lors du premier accès à l'administration, Payload propose de créer le premier
compte administrateur.

## Variables d'environnement

| Variable | Obligatoire | Description | Exemple local |
| --- | --- | --- | --- |
| `DATABASE_URI` | oui | URL de connexion PostgreSQL utilisée exclusivement côté serveur | `postgresql://postgres:postgres@localhost:5432/lasource` |
| `PAYLOAD_SECRET` | oui | Secret d'au moins 32 caractères servant à signer les jetons Payload | valeur générée avec `openssl rand -base64 32` |
| `NEXT_PUBLIC_SERVER_URL` | non | URL canonique publique, sans slash final ; vaut `http://localhost:3000` par défaut | `http://localhost:3000` |

Ne commitez jamais `.env` ni des identifiants réels. `.env.example` contient
uniquement des valeurs factices destinées au développement local.

## Validation

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

La CI exécute ces quatre contrôles pour chaque pull request et chaque push sur
`main`.

## Structure

```text
src/
├── app/
│   ├── (frontend)/   # application publique Next.js
│   └── (payload)/    # administration et API Payload CMS
├── collections/      # collections Payload (authentification uniquement)
├── lib/              # configuration partagée et tests unitaires
└── payload.config.ts # configuration Payload et adaptateur PostgreSQL
```

## Commandes utiles

| Commande | Usage |
| --- | --- |
| `npm run dev` | démarre Next.js en développement |
| `npm run build` | produit le build de production |
| `npm start` | démarre le build de production |
| `npm run lint` | exécute ESLint sans tolérer d'avertissement |
| `npm test` | exécute les tests Vitest |
| `npm run typecheck` | vérifie TypeScript strict sans produire de fichiers |
| `npm run generate:types` | régénère les types Payload après modification des collections |
