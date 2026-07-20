# Modèle métier conceptuel

Ce document décrit les responsabilités du domaine, sans définir de schéma Payload ni d'API.

## Technologie

La Technologie est l'entité racine. Elle porte son identité, ses liens officiels, son positionnement, sa fraîcheur et son statut éditorial. Son identifiant public stable est un slug unique.

## Contenu documentaire

Un contenu explique un aspect d'une ou plusieurs technologies : présentation, cas d'usage, concept, installation, tutoriel, recette, erreur fréquente, comparaison, FAQ ou note de version. Il possède ses propres sources et son cycle éditorial.

## Source

Une Source qualifie la provenance d'une information : URL, type, éditeur, date de consultation et éventuellement version concernée. Les sources officielles sont prioritaires.

## Version et vérification

Une Version représente un état publié d'une technologie. Une Vérification atteste qu'une information a été revue à une date donnée, par un humain ou un processus identifié, sans garantir sa validité éternelle.

## Relations

Les relations relient des technologies ou contenus avec un sens explicite : alternative, compatibilité, dépendance, intégration, remplacement, tutoriel lié ou recette liée. Elles doivent pouvoir être expliquées et sourcées.

## Statut éditorial

Le cycle minimal distingue brouillon et publié. Des états supplémentaires ne seront introduits que si le workflow réel les exige. Un contenu non publié n'est jamais exposé comme connaissance publique.

Le détail des sections documentaires figure dans [`CONTENT_MODEL.md`](CONTENT_MODEL.md).
