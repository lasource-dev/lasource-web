# Workflow produit et éditorial

## Du besoin à la publication

1. **Cadrer** : formuler l'objectif, le public, les critères d'acceptation et les exclusions.
2. **Décider** : documenter les choix structurants dans un ADR lorsque nécessaire.
3. **Concevoir** : identifier données, sources, relations, parcours et risques sans sur-modéliser.
4. **Produire** : travailler sur une branche dédiée avec un périmètre limité.
5. **Vérifier** : exécuter lint, tests, TypeScript et build ; contrôler sources, secrets et documentation.
6. **Relire** : examiner le diff, les suppressions, les dépendances, les migrations et les effets publics.
7. **Publier** : fusionner après validation humaine et contrôles verts.
8. **Maintenir** : mesurer l'usage, planifier la prochaine vérification et corriger les informations obsolètes.

## Cycle éditorial

Tout nouveau contenu commence en brouillon. L'IA peut proposer une structure, collecter des sources et signaler des incohérences. Le relecteur humain vérifie les affirmations, la qualité des sources, le ton, la fraîcheur et l'aptitude à la publication.

## Règles de changement

- une fonctionnalité ou décision par PR lorsque possible ;
- aucun changement fonctionnel caché dans une PR documentaire ;
- documentation et changelog mis à jour avec le changement concerné ;
- une PR n'est pas fusionnée si les contrôles requis échouent ;
- les retours de relecture deviennent des corrections vérifiables, pas des commentaires perdus.
