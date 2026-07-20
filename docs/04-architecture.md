# Architecture de référence

## Intention

L'architecture sépare la connaissance canonique de ses canaux de diffusion. Elle reste monolithique au départ afin de réduire le coût opérationnel.

## Composants

- **Payload CMS** gère les entités, le cycle éditorial et l'administration.
- **PostgreSQL** stocke les données structurées et leurs relations.
- **Next.js** fournit l'expérience web publique et les métadonnées associées.
- **Référentiel Git** conserve la documentation, les décisions et les placeholders de connaissance versionnés.
- **Canaux futurs** — newsletter, MCP, API, Skills et formations — consomment la même connaissance canonique selon des contrats dédiés.

## Frontières

- les détails de rendu appartiennent aux canaux, pas au modèle canonique ;
- les secrets et données opérationnelles ne vivent pas dans Git ;
- la publication publique respecte le statut éditorial ;
- les interfaces programmatiques ne sont ajoutées qu'avec un cas d'usage défini ;
- les décisions difficiles à inverser sont consignées dans `docs/adr/`.

## Qualités attendues

TypeScript reste strict. Les évolutions doivent préserver la simplicité, la maintenabilité, la performance, la sécurité des secrets, la traçabilité des sources et la reproductibilité des validations.

Ce document n'engage aucune API ni topologie de déploiement définitive.
