.. include:: ../substitutions.txt
.. |add| image:: add.png

.. _create_wms:

Créer une couche WMS
====================

Si vous voulez attacher un calque cartographique à la métadonnée que vous venez de créer, ou bien si vous voulez ajouter un calque dans l'arborescence de l'onglet *Sélectionner*, vous
devrez probablement créer une nouvelle couche WMS (*Web Map Service*, service cartographique pour le web).

Ce n'est pas à la portée de tous, car il faut :

- Avoir au moins des connaissances de bases sur les SIG (*Systèmes d'Information Géographique*).

- Apprendre comment |gs| fonctionne.

- Mettre les données sur le serveur, accessibles pour |gs|.

- Se connecter dans |gs| et publier la donnée dans |gs|.

- Ajouter la couche dans |gn|.


SIG : éléments de base
----------------------

Il est important d'avoir au moins des connaissances de base sur les SIG.
**Une introduction aux SIG est bien en-dehors des objectifs de ce document. Il est cependant conseillé, si vous en avez besoin, de vous inscrire à une formation d'introduction aux SIG.**

Pourquoi est-ce important ?
```````````````````````````

Les données géospatiales ont des caractéristiques bien particulières. si vous n'en avez pas une connaissance minimum, tout ce que vous pourrez faire avec risque de s'avérer très aléatoire.
Par exemple, tout logiciel SIG va supposer que vous savez : 

- la différence entre des données vectorielles et des données raster.

- La projection utilisée.

Et ce n'est là que le début !

Certains formats de données SIG peuvent contenir des données très différentes les unes des autres. Le format GeoTiff (données raster), en particulier, est un conteneur très souple : 
un fichier GeoTiff peut contenir une seule bande de données avec des valeurs entre 0 et 255, tout comme plusieurs bandes de données dont les plages de valeurs sont arbitraires 
(des valeurs "réelles", souvent, s'étalant par exemple entre -2305 et +4000).
Les données Shapefile (données vecteur) ne sont en fait pas un fichier mais un ensemble de fichiers, qu'il ne faudrait *jamais* séparer : supprimer un des fichiers et la donnée 
peut s'avérer irrécupérable.
Et ce ne sont que des exemple !

En outre, |gs| n'est pas un logiciel SIG de bureau mais un serveur cartographique. D'autres facteurs interviennent alors : optimisation de l'espace disque, des ressources, 
publication des données dans une base de données géospatiale, etc.

Apprendre à utiliser |gs|
-------------------------

|gs| est très bien documenté, en profondeur, dans leur `documentation officielle  <http://docs.geoserver.org/2.5.x/en/user/>`_. 
Vous êtes prié de vous y référer pour tout ce qui touche à l'usage de |gs|. En complément, de très bons livres existent sur |gs|. Il est aussi possible de s'inscrire à des formations
sur |gs|.

Il est fortement conseillé d'installer une instance de |gs| sur votre ordinateur, pour vous entraîner, tester et faire vos premières publications de données dans un contexte facile 
et sans risque de corrompre le serveur cartographique de ce projet.
Puis si la publication s'est bien passé sur votre ordinateur, vous pourrez envisager de publier la même donnée sur le serveur.
*Seules des personnes raisonnablement expérimentées dans l'usage de |gs| devraient être autorisées à intervenir sur le serveur de production !*

Mettre les données sur le serveur
---------------------------------

Après avoir correctement publié les données sur l'instance |gs| *de votre ordinateur*, vous pourrez donc envisager de les publier sur l'instance |gs| du Géoportail.

Pour cela, vous devrez en premier lieu placer les données sur le serveur et obtenir un identifiant pour vous connecter à l'instance |gs| du serveur.

Pour transférer les données sur le serveur, vous devez vous adresser à l'`Administrateur Système <jean.pommier@pi-geosolutions.fr>`_du Géoportail.
Selon que vous allez publier régulièrement des données, ou biend e façon très occasionnelle, il vous fournira un accès sur le serveur, ou bien il vous demandera de lui fournir les données
de sorte qu'il les place lui-même sur le serveur.

Pour avoir un identifiant |gs|, vous devrez vous adresser à quelqu'un disposant de droits d'administration dans |gs|. Vous pouvez aussi vous adresser à 
l'`Administrateur Système <jean.pommier@pi-geosolutions.fr>`_du Géoportail.

|gs| : se connecter et publier un jeu de données
------------------------------------------------

Une fois que vous avez vos identifiants, vous opurrez vous connecter sur l'instance |gs| du portail.
L'adresse actuelle est 
`http://bi-risk.pigeo.fr/geoserver-prod/web/ <http://bi-risk.pigeo.fr/geoserver-prod/web/>`_.

Une fois connecté, vous aurez juste à reproduire les étapes que vous avez suivi pour publier la donnée sur l'instance |gs| installée sur votre ordinateur.

**N'oubliez pas :** la `documentation <http://docs.geoserver.org/2.5.x/en/user/>`_ |gs| est votre amie !

Ajouter une couche dans |gn|
----------------------------

Il y a deux cas de figure à considérer : 

- Attacher une couche WMS à la métadonnée

- Ajouter le calque WMS dans l'onglet *Sélectionner* (voir  :ref:`layertree`).


Attacher une couche WMS à la métadonnée
```````````````````````````````````````

Cela se fait depuis le formulaire d'édition de la métadonnée. Dans le coin en haut à droite, cliquer sur le bouton |add| et choisir *Ajouter une ressource en ligne*.


.. figure:: add_online_res_1.png
   :scale: 50 %
   :align: right

   Ouvrir le menu 'Ajouter une ressource'

Une fenêtre s'ouvrira, contenant un bref formulaire. Cocher *URL de la ressource* et saisir : 

- **URL**: si vous utilisez le serveur |gs| du Géoportail, ce sera ``http://bi-risk.pigeo.fr/geoserver-prod/bi/wms?``

- **Libellé**: vous mettrez ici le nom de la couche telle que définie dans |gs|. Ca sera quelque chose du genre ``bi:bi_4c_sols``

- **Description**: saisissez ici le texte que vous voulez voir apparaître dans la fiche de métadonnées, pour le lien vers cette couche carto. 
  Ce sera en général le nom de la couche, écrit de façon lisible. Par exemple ``Composition des sols``
  
- **Protocol**: à moins de savoir  ce que vous faites, sélectionnez ``OGC-WMS Web Map Service``


.. figure:: add_online_res_2.png
   :scale: 50 %
   :align: right
   
   Ajouter une couche WMS

Puis cliquez sur le bouton *Transférer* (nom impropre dans ce cas de figure), et c'est tout. Le calque WMS devrait maintenant être listé dans l'encart *Ressources associées* 
en haut à droite.

