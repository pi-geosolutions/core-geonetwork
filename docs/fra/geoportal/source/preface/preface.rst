.. _preface:.. _preface:
.. include:: ../substitutions.txt

Préface
=======

Le |project| est issu de la dernière génération d'outils cartographiques Open Sources L'ensemble de l'outil est réalisé à partir de composants Open Source, 
dont les principaux sont GéoNetwork, GeoServer, OpenLayers / ExtJS / GeoExt, et PostgreSQL/PostGIS pour les bases de données.

Le résultat est plus un logiciel qu'un site web. Disons un logiciel en ligne. Ce type d'application est habituellement appelée un géoportail. Dans ce document, 
nous l'appellerons |project|, ou simplement géoportail.

Il a été réalisé grâce au financement de la Banque Mondiale.

Un nouveau concept
==================

Les géoportails sont des concepts relativement récents, et sont encore en période de maturation. Ils répondent au besoin pour un stockage sécurisé et 
organisé des données géospatiales. Ils fournissent généralement des outils pour manipuler les données stockées : recherche, visualisation, etc.

Historiquement, les géoportails se composent de deux parties :

- un composant cartographique, permettant de visualiser des couches de données cartographique dans une interface dynamique en ligne. 
  Souvent, les utilisateurs ne vont pas plus loin.

- un deuxième composant, de catalogage de données. Celui-ci est habituellement découplé du premier. Sa fonction est l'archivage et la recherche de documents, 
  y compris cartographiques. 
  Il s'agit d'un outil de gestion bibliothécaire. Les fiches d'information sont appelées **métadonnées**.
  C'est en fait la partie la plus importante.

Le |project|  représente une approche novatrice, en regroupant ces deux outils. Cela apporte de nombreux avantages, dont : 

- Interactions facilitées entre catalogue et carte dynamique : 

  * Les documents cartographiques catalogués peuvent être rajoutés dans la carte dynamique, d'un simple clic. 

  * Les résultats de recherches sont affichés directement dans la carte, en surimpression.
  
  * Les couches cartographiques de la carte dynamique sont reliées à leurs métadonnées, directement.
  
- Des outils mis en commun : de nombreuses fonctions sont communes aux deux outils.

- Un code informatique mutualisé, donc plus léger au total.

- Une seule interface unifiée, un accès plus simple

Cet outil devient un véritable **Système d'Informations** riche et complet.