# Changelog

Les changements significatifs de LaSource.dev sont consignés ici. Le format suit les principes de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) sans imposer encore de versionnement produit.

## Non publié

### Ajouté

- documentation fondatrice du produit, de la taxonomie, du modèle documentaire, de l'architecture et du workflow ;
- première décision d'architecture consacrant la Technologie comme entité racine ;
- placeholders du futur référentiel de connaissance.
- collection Payload `technologies` et page publique `/technologies/[slug]` avec publication, fraîcheur, sources provisoires et métadonnées SEO.
- ressource Payload `categories`, relation principale `Technology N → 1 Category` et migration réexécutable du champ textuel historique.
- ressource Payload `sources`, provenance contrôlée et relation traçable depuis `Technology`.
