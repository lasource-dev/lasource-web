# Architecture de référence

## Intention

L'architecture sépare la connaissance canonique de ses canaux de diffusion. Elle reste monolithique au départ afin de réduire le coût opérationnel.

## Composants

- **Payload CMS** est la source canonique des entités et contenus ; il gère leur cycle éditorial, leurs versions et l'administration.
- **PostgreSQL** stocke les données structurées et leurs relations.
- **Next.js** fournit l'expérience web publique et les métadonnées associées.
- **Référentiel Git** conserve le code, les migrations, la documentation et les décisions, mais pas la version canonique des contenus éditoriaux.
- **Canaux futurs** — newsletter, MCP, API, Skills et formations — consomment la même connaissance canonique selon des contrats dédiés.

## Frontières

- les détails de rendu appartiennent aux canaux, pas au modèle canonique ;
- les secrets et données opérationnelles ne vivent pas dans Git ;
- aucun build ou déploiement ne réimporte automatiquement un corpus éditorial dans Payload ;
- la publication publique respecte le statut éditorial ;
- les interfaces programmatiques ne sont ajoutées qu'avec un cas d'usage défini ;
- les décisions difficiles à inverser sont consignées dans `docs/adr/`.

## Qualités attendues

TypeScript reste strict. Les évolutions doivent préserver la simplicité, la maintenabilité, la performance, la sécurité des secrets, la traçabilité des sources et la reproductibilité des validations.

Ce document n'engage aucune API ni topologie de déploiement définitive.
