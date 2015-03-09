.. _map:

.. include:: ../substitutions.txt
.. |folder| image:: folder.png
.. |folder_open| image:: folder-open.png
.. |wms| image:: map_go.png
.. |chart| image:: chart.png
.. |i| image:: icon_featureinfo_16px.png
.. |M| image:: icon_metadata_16px.png
.. |pquery| image:: polygon_query_16px.png
.. |rm| image:: delete_layer.png

.. index:: Overlay, Layer


Construire une carte
====================

L'une des fonctions principales d'un géoportail est de pouvoir composer des cartes : :ref:`sélectionner des calques <select_overlays>`, :ref:`organiser ces calques <organize_overlays>`, 
:ref:`les composer entre eux <manage_overlays>` pour à la fin :ref:`imprimer <print>` des cartes. Ce chapitre est organisé en suivant ce flux typique de travail : 

.. _select_overlays:

.. index:: pair: WMS; Layer
.. index:: pair: Chart; Layer

Sélectionner des calques
------------------------

Cela se passe dans le :ref:`panneau latéral<left_panel>`, premier onglet : tout calque coché est automatiquement ajouté à la carte.

Cette liste de calques est organisée de façon hiérarchique dans une structure arborescente : il faut déplier un dossier pour voir ce qu'il contient. 
Il peut contenir différents types de *noeuds* : 

- D'autres dossiers. Les dossiers sont représentés par un|folder| quand ils sont fermés, et par un |folder_open| lorsqu'ils sont ouverts. Ce sont des contenants, 
  servant à la hiérarchisation du contenu. Ils n'ont pas de cases à cocher.

- Des calques WMS. Ce sont les plus courants. Ils sont représentés par une icône |wms| et une case à cocher. 
 
- Des calques graphiques (*Charts*). Ils sont moins courants. Ils s'afficheront dans la carte sous forme de camemberts ou d'histogrammes, positionnés à des emplacements clés. 
  Ils sont représentés dans l'arborescence par une icône |chart| et une case à cocher.

Certains *noeuds* ont une description : elle s'ouvrira lors d'un survol prolongé de la souris sur le noeud.


.. _organize_overlays:

Organiser les calques
---------------------

C'est la fonction du second onglet, l'onglet *Organser*. 

Les calques cochées dans l'onglet *Choisir* sont rangés, par défaut, dans l'ordre d'apparition dans l'arborescence.

.. figure:: organize_wrong.png

   Les calques, empilés "comme ça vient" : les limites adminitratives sont cachées derrière le calque Population (opaque).
   
Parfois, l'organisation par défaut conviendra, mais la plupart du temps, et surtout si on coche de nombreux calques, ils ne s'empileront pas comme vous le voulez. 
Il faudra alors les réorganiser entre-eux. C'est le rôle principal de cet onglet.
Réorganiser les calques est simple : il suffit de cliquer sur le calque à bouger, garder le bouton appuyé et déplacer le calque à son nouvel emplacement, suivant le principe du 
"Drag'n'Drop". L'emplacement où le calque sera repositionné est indiqué par une ligne en pointillés.
Lorsque vous avez atteint le bon emplacement, relachez le bouton de la souris.
   
.. figure:: organize_DnD.png

   Réorganiser les calques
   
   
.. _change_background_map:
   
.. index:: pair: Background; Layer
   
Changer le fond de carte
------------------------

Le fond de carte par défaut est une carte Bing Aerial (carte "satellite"). Il est possible de le changer contre un fond OpenStreetMap.
Le choix du fond de carte se passe dans le dossier *Fond de carte* de l'onglet *Organiser*. 

Un seul fond peut être affiché à la fois.

.. figure:: OSMonBanjul.png

   Fond OpenStreetMap sur Banjul, Gambie
   
.. note:: Les cartes OpenStreetMap sont plus compressibles qu'une image satellite, ce qui va se concrétiser par des besoins réduits en bande passante que 
   si on utilisait le fond Bing Aerial. Donc si vous n'avez pas l'usage d'un fond Bing Aerial (par exemple si un de vos claques couvre tout le territoite, cachant le fond 
   de carte), autant utiliser OpenStreeMap.
          
.. note:: Les cartes Bing maps ne sont pas supportées par le module d'impression (problème de licences d'utilisation). 
   Pour imprimer, il vaut donc mieux utiliser OpenStreetMap
   

.. _manage_overlays:

Paramétrer un calque
--------------------

Afficher la légende
```````````````````

La plupart des calques sont dotés d'une petite flèche noire dirigée vers le bas, juste avant la case à cocher. Cliquer sur cette flèche va déplier la légende, 
juste en-dessous du calque. Un second clic repliera la légende.

.. figure:: legend.png

   Déplier la légende
   
Dans le cas de certains calques (cartes scannées), la légende est très volumineuse et n'est pas diponible suivant un format adapté, pour un affichage en ligne dans le panneau.
Dans ces cas, il est possible de l'afficher dans une fenêtre séparée, en pop-up : cliquer droit (bouton droit) sur le calque, et choisir '*Ouvrir la légende dans un pop-up*'.

.. figure:: legendInPopup.png

   Ce calque provient d'une carte scannée. Sa légende est trop grande pour un affichage correct. Le meilleur moyen reste de l'ouvrir dans un pop-up séparé.


.. _layers_icons:

Informations sur le calque
``````````````````````````

A droite du nom d'un calque, des icônes vous signalent quels outils d'information disponibles pour ce calque donné : 

- |i| informe que ce calque est *interrogeable*, signifiant que vous pouvez utiliser l'outil :ref:`Interrogation <query_layers>` sur ce calque.

- |pquery| informe que ce calque supporte l'outil :ref:`Interrogation Polygonale <polygon_query>`.

- |M| informe qu'un fiche de métadonnées est disponible pour ce calque.

Ce sont juste des icônes informatives, vous informant des actions que vous pourrez effectuer : il est inutile de cliquer dessus, il ne se produira rien.
Chacune de ces actions est déclenchée à sa façon (voir plus loin).

.. figure:: info_icons.png

   Dans ce cas, tous les calques sont interrogeables. Population density et Elevation sont disponibles pour l'outil Interrogation Polygonale et ont
   une fiche de métadonnées disponible. Road Network a aussi une fiche de métadonnées.

Afficher les métadonnées
************************

Un calque disposant de métadonnées associées sera signalé par un indicateur |M|. Si l'on sélectionne un tel calque (clic gauche dessus), le bouton |M| dans la 
barre d'outils du panneau latéral s'active. Dans le menu contextuel de ce calque (clic droit sur le calque), l'entrée *Métadonnées* sera également activé.

Cliquer sur l'un de ces deux boutons ouvrira la fiche de métadonnées, si vous disposez des droits suffisants pour accéder aux métadonnées de ce calque. 
Sinon (droits d'accès insuffisants), un message vous en informera. En effet, dans certains cas, l'accès est restreint et il faut disposer d'un compte pour se connecter 
au géoportail comme utilisateur authentifié.

.. figure:: openMtd.png
   :scale: 50 %

   Ouvrir la fiche de métadonnées (à droite)
   
Voir aussi la section :ref:`geocatalog`.

Utiliser les contrôles d'opacité / rideau ('*swipe*')
`````````````````````````````````````````````````````

.. index:: pair: Transparency; Control

Opacité
*******

Il est possible de rendre un calque partiellement transparent. Cela permet de superposer plusieurs calques et de produire des effets de rendu. Par exemple, superposer un
calque d'ombrages par-dessus une carte topo, mettant en valeur le relief.

.. figure:: opacity.png

   Superposer une représentation des pentes par-dessus une carte topo met en valeur le relief, ajoutant un effet 3D...

Cliquer-droit sur un calque, pour ouvrir son menu contextuel. Plusieurs actions sont proposées, l'une d'elles s'appelant '*Opacité*'. 
Lorsqu'on la survole, cela ouvre un curseur. On peut régler l'opacité (donc la transparence) en déplaçant ce curseur entre 1 (complètement opaque) et 0 (invisible).

.. note:: Régler l'opacité à 0 (invisible) va automatiquemen décocher le calque. Il est important de s'en souvenir, puisque les calques décochés sont automatiquement 
   régulièrement 'nettoyés' de l'onglet *Organiser*. 
          
.. index:: pair: Curtain; Control

Contrôles rideau ('*swipe*')
****************************

Il arrive que l'on veuille comparer deux calques superposés. Par exemple pour comparer une même donnée à deux dates différentes.
Pour cela, on peut utiliser la transparence, mais ce n'est pas toujours le meilleur moyen. Si l'on veut conserver la totale opacité de nos calques, on peut utiliser les
contrôles "rideau".

Ils fonctionnent comme si le calque actif était un rideau : on peut replier le rideau pour révéler ce qui se trouve derrière. En déplaçant le rideau, on peut voir, 
sur cet espace dégagé, la donnée qui se trouve derrière.

Le contrôle rideau est disponible à la fois horizontalement et verticalement.

Ouvrir le menu contextuel en cliquant (clic-droit) sur le calque. Positionner la souris sur le rideau voulu (horizontal ou vertical) et bouger le curseur. 
L'effet se voit particulièrement bien sur un calque plein, mais le rideau marche même sur un calque de graphiques ou de points.


.. figure:: curtains.png

   Utilisation du rideau horizontal pour comparer localemet la carte des sols et la carte d'occupation des sols.

.. note:: Les réglages rideau et transparence sont conservés pour ce calque, même s'il est supprimé de l'onglet *Organiser* et re-coché ensuite. Attention aux surprises !
   Les réglages ne seront réinitialisés qu'au rechargement de la page dans le navigateur. Il est bien sûr possible de les réinitialiser manuellement en replaçant les 
   curseurs à leur position initiale.

Supprimer un calque
```````````````````

Il y a trois façons de supprimer un calque de la carte, depuis l'onglet *Organiser* : 

- Cliquer sur '*Supprimer*' dans le menu contextuel

- Sélectionner le calque et cliquer sur le bouton |rm| dans la barre d'outils du panneau

- Décocher le calque, changer d'onglet et revenir.

.. note:: Cette dernière solution utilise la fonctionnalité de 'nettoyage automatique' de l'onglet *Organiser* : chaque calque décoché est supprimé lorsqu'on change d'onglet. 
   Cela permet d'éviter une potentielle surpopulation de l'onglet *Organiser*.
          
Il est bien sûr aussi possible de le décocher depuis l'onglet *Choisir*.

Ajouter d'autres calques
------------------------

Ajouter un calque WMS externe
`````````````````````````````

Il est possible d'ajouter des calques provenant de services cartographiques externes, via le premier bouton dans la barre d'outils du panneau (Ajouter WMS).
WMS signifie *Web Map Service*, Service Cartographique pour le Web. Cet outil permt de choisir dans une liste de services préconfigurés, ou bien d'en rajouter un nouveau 
(vous devez connaitres son adresse WMS).
Il listera alors les calques disponibles depuis ce service, et vous pourrez ajouter certains de ces calques dans la carte.


Ajouter un calque depuis le catalogue
`````````````````````````````````````

Il est aussi possible de rajouter des calques suite à une recherche dans le :ref:`geocatalog`. Lorsque des calques sont associés à une fiche de metadonnées
il est possible, en clquant sur l'icône, et les rajouter dans la carte. Cette opération est expliquée dans la section :ref:`geocatalog`.
