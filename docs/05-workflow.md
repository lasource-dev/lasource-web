# Workflow produit et éditorial

## Du besoin à la publication

1. **Cadrer** : formuler l'objectif, le public, les critères d'acceptation et les exclusions.
2. **Décider** : documenter les choix structurants dans un ADR lorsque nécessaire.
3. **Concevoir** : identifier données, sources, relations, parcours et risques sans sur-modéliser.
4. **Produire** : créer ou modifier un brouillon dans Payload ; utiliser une branche Git uniquement pour le code, le schéma ou la documentation.
5. **Vérifier** : contrôler les sources, les relations, le rendu et les informations sensibles ; exécuter les validations techniques lorsqu'il y a du code.
6. **Relire** : comparer la version Payload, vérifier les affirmations et renseigner le relecteur ainsi que la date de vérification.
7. **Publier** : passer les deux statuts éditorial et Payload à `published` après validation humaine.
8. **Maintenir** : mesurer l'usage, planifier la prochaine vérification et corriger les informations obsolètes.

## Cycle éditorial

Tout nouveau contenu commence en brouillon. L'IA peut proposer une structure, collecter des sources et signaler des incohérences. Le relecteur humain vérifie les affirmations, la qualité des sources, le ton, la fraîcheur et l'aptitude à la publication.

Payload conserve les brouillons, l'historique des versions et la version publiée. Une automatisation peut créer ou mettre à jour un brouillon avec un compte dédié. Elle ne publie pas et ne modifie pas la version publique sans validation humaine explicite.

## Règles de changement

- une fonctionnalité ou décision par PR lorsque possible ;
- aucun changement fonctionnel caché dans une PR documentaire ;
- documentation et changelog mis à jour avec le changement concerné ;
- une PR n'est pas fusionnée si les contrôles requis échouent ;
- les retours de relecture deviennent des corrections vérifiables, pas des commentaires perdus.
- un import de fichiers historiques est une migration manuelle, jamais une étape de build ou de déploiement.
