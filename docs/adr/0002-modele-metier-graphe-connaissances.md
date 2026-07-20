# ADR 0002 — Le modèle métier repose sur un graphe de connaissances

## Décision

Le modèle métier de LaSource.dev est conçu comme un graphe de connaissances. Toutes les ressources peuvent être reliées entre elles par des relations explicites, typées et vérifiables. Aucun contenu publié n'est considéré comme isolé de son contexte.

## Contexte

LaSource.dev doit alimenter le site, le serveur MCP, la newsletter et de futurs produits à partir d'une même connaissance. Une organisation en fiches indépendantes limiterait les compatibilités, comparaisons, stacks, recommandations et parcours transversaux. L'ADR 0001 a établi la Technologie comme entité racine ; il reste à définir comment les ressources s'organisent autour d'elle.

## Pourquoi

Un graphe exprime directement le sens des liens entre technologies, catégories, sources et contenus. Il permet de reconstruire des vues adaptées à chaque canal sans dupliquer les faits. Les relations rendent aussi la provenance, la navigation et les évolutions plus faciles à expliquer et à vérifier.

## Conséquences

- les pages et produits sont construits à partir des ressources et de leurs relations ;
- chaque relation possède un type, une source, une cible et, lorsque nécessaire, une provenance ;
- les relations invalides, ambiguës ou dupliquées doivent pouvoir être détectées ;
- les besoins de traversée du graphe orientent les futurs index et contrats de lecture ;
- l'ontologie minimale est versionnée dans `knowledge/ontology.yaml` ;
- cette décision n'impose encore ni schéma Payload, ni API, ni moteur de graphe dédié.
