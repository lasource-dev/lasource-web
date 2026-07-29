# Modèle métier conceptuel

Ce document décrit les responsabilités du domaine, sans définir de schéma Payload ni d'API.

## Technologie

La Technologie est l'entité racine. Elle porte son identité, ses liens officiels, son positionnement, sa fraîcheur et son statut éditorial. Son identifiant public stable est un slug unique.

L'implémentation initiale utilise l'UUID natif Payload comme identifiant métier immuable. Le slug est généré et normalisé à la création à partir du nom canonique lorsqu'il n'est pas fourni. Il reste ensuite stable, y compris si le nom canonique change, afin de préserver l'URL publique ; toute modification explicite est rejetée.

Les alias sont nettoyés sans modifier leur graphie utile : espaces externes retirés, espaces internes regroupés, doublons éliminés sans distinction de casse et nom canonique exclu. L'ordre et la casse de la première occurrence sont conservés. Une mise à jour qui ne fournit pas d'alias laisse la liste existante intacte.

La Technologie synchronise le statut éditorial avec les brouillons Payload et conserve un état de fraîcheur ainsi qu'une date de vérification. Elle peut référencer plusieurs Sources ; une Technologie publiée ne peut citer que des Sources publiées et actives.

## Catégorie

La Catégorie est une ressource autonome qui classe une famille de technologies. Elle possède un UUID et un slug stables, un nom canonique, des alias éventuels, une description et son propre cycle éditorial.

Une Technologie appartient à exactement une catégorie principale (`belongs_to_category`) et une Catégorie classe plusieurs technologies (`classifies`) : la cardinalité est `Technology N → 1 Category`. Une Technologie ne peut être publiée que si sa catégorie est elle-même publiée et non archivée. Une catégorie utilisée par une technologie publiée ne peut pas être archivée ou dépubliée.

## Contenu documentaire

Un contenu explique un aspect d'une ou plusieurs technologies : présentation, cas d'usage, concept, installation, tutoriel, recette, erreur fréquente, comparaison, FAQ ou note de version. Il possède ses propres sources et son cycle éditorial.

## Source

Une Source qualifie la provenance d'une information. Son UUID est immuable et son URL canonique est unique. Elle porte un type contrôlé, un titre, un auteur et une date de publication facultatifs, un score de confiance entier de 0 à 100 et une date de dernière vérification.

L'URL est normalisée en retirant les fragments et les paramètres de suivi connus (`utm_*`, `gclid`, `fbclid`) sans supprimer les paramètres fonctionnels. Une Source active doit être vérifiée avant publication. Son cycle éditorial comprend brouillon, publication et archivage. La Source n'a pas de page publique autonome à ce stade.

## Version et vérification

Une Version représente un état publié d'une technologie. Une Vérification atteste qu'une information a été revue à une date donnée, par un humain ou un processus identifié, sans garantir sa validité éternelle.

## Relations

Une Relation relie deux Technologies avec un sens explicite et des Sources justificatives. Son UUID, ses extrémités et son type sont immuables. Une clé canonique unique empêche les doublons ; elle trie les extrémités des relations symétriques et conserve l'ordre des relations dirigées.

`compatible_with`, `alternative_to` et `integrates_with` sont symétriques. `depends_on`, `uses`, `supports` et `replaces` sont dirigées. `developed_by` reste réservé jusqu'à la création d'une ressource Organization. Les auto-relations sont interdites ; les cycles restent autorisés et ne sont pas analysés dans cette première version.

Une Relation ne peut être publiée que si ses deux Technologies et au moins une Source sont publiées et actives, et si elle possède une date de vérification. Une ressource citée par une Relation publiée ne peut pas devenir non publique.

## Statut éditorial

Le cycle minimal distingue brouillon et publié. Des états supplémentaires ne seront introduits que si le workflow réel les exige. Un contenu non publié n'est jamais exposé comme connaissance publique.

Le détail des sections documentaires figure dans [`CONTENT_MODEL.md`](CONTENT_MODEL.md).
