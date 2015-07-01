.. _preface:.. _intro:
.. include:: ../substitutions.txt

Introduction
============

L'application |project| est en fait une extension réalisée par-dessus `GeoNetwork OpenSource <http://geonetwork-opensource.org>`_, une application de géocatalogue,
centrée sur la cartographie des données, et soutenue par le serveur cartographique `GeoServer <http://geoserver.org>`_.

Cette documentation fera donc de nombreuses références à la documentation GeoNetwork, au sujet de la gestion des métadonnées, et à la documentation de GeoServer lorsqu'il 
s'agira de la gestion des couches cartographiques.

|project| et |gn|
-----------------

|gn| est une application serveur, faisant office de **catalogue de métadonnées** et offrant des capacités limitées en termes d'affichage cartographique des données.
|gn| a récemment été enrichi d'un système de *widgets*. Il s'agit d'un system permettant de brancher des interfaces publiques personnalisées sur une instance |gn| standard.

Le |project|  fait usage de cette capacité et est construit comme un *widget* pour |gn|, enrichissant la partie cartographique.

Alors que la partie interface publique est entièrement spécifique au projet |project|, et dûment documentée dans le 
`Manuel Utilisateurs <../../../../geoportal/build/html/index.html>`_,  les parties éditeur et administrateur sont massivement héritées de |gn| (et |gs| pour ce qui touche à la conception 
des données cartographiques).

Le panneau principal d'administration est donc le même que pour une instance standard de |gn|, à part opur la partie gestion du Référentiel de Données Cartographiques.


|project| et |gs|
-----------------

Comme il a été dit, |gn| s'occupe de la gestion des métadonnées (et donc du catalogage des données), et |gs| s'occupe de la création des calques cartographiques à partir 
des données. Le Référentiel de Données Cartographiques, conçu par nos soins, fait le lien.

|gs| est l'application qui prend les données SIG en entrée, et les restitue, en sortie, dans un format utilisable dans les applications de web-mapping. Il produit aussi les légendes,
et traite les requêtes d'interrogation, ainsi que des requêtes plus complexes, comme par exemple celles générées par l'outil d'interrogation polygonale.