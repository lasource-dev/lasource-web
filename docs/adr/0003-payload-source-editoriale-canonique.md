# ADR 0003 — Payload est la source éditoriale canonique

## Statut

Accepté le 9 août 2026.

## Contexte

Les contenus étaient rédigés dans `content/production`, versionnés dans Git puis
réimportés dans Payload à chaque build Vercel. Payload servait les pages et
conservait les versions, mais une modification réalisée dans son administration
pouvait être écrasée par le déploiement suivant.

Ce double système rendait la source de vérité ambiguë et imposait un passage par
GitHub pour toute publication éditoriale.

## Décision

Payload et PostgreSQL deviennent la source canonique des contenus. Le build
applique les migrations de schéma puis construit l'application, sans importer de
contenu. La création, la relecture, la publication et la restauration de versions
ont lieu dans Payload.

Le corpus `content/production` est conservé comme historique et source de
migration. Son import exige une autorisation explicite et ne peut pas être lancé
automatiquement par le build.

Les automatisations éditoriales écrivent des brouillons au moyen d'une identité
dédiée et révocable. La publication reste une action humaine explicite.

## Conséquences

- publier dans Payload ne nécessite plus de commit ni de déploiement ;
- les modifications réalisées dans le CMS ne sont plus écrasées par Git ;
- Git reste la source de vérité du code, des migrations et des décisions ;
- une sauvegarde PostgreSQL et une stratégie d'export deviennent nécessaires ;
- l'accès machine-à-machine doit appliquer des permissions limitées aux brouillons.
