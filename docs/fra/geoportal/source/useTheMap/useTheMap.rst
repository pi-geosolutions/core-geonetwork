.. _use_the_map:

.. include:: ../substitutions.txt
.. |measure_area| image:: ruler_square.png
.. |measure_line| image:: ruler.png
.. |history_prev| image:: resultset_previous.png
.. |history_next| image:: resultset_next.png
.. |zoomout| image:: icon_zoomout.png
.. |zoomin| image:: icon_zoomin.png
.. |zoomfull| image:: icon_zoomfull.png
.. |savewmc| image:: icon_savewmc.png
.. |pan| image:: icon_pan.png
.. |loadwmc| image:: icon_loadwmc.png
.. |featureinfo| image:: icon_featureinfo.png
.. |icon_submenu| image:: icon_submenu.png
.. |query_marker| image:: query.png


Utiliser la carte
=================

L'essentiel des manipulations, concernant la carte, se fait avec la souris et la barre d'outils de la carte.

|zoomfull| |zoomin| |zoomout| |pan| Zoomer avant / arrière et déplacer la carte
-------------------------------------------------------------------------------


.. index:: pair: Zoom; Control

Zoom
````

On peut simplement zommer avant / arriève avec la molette de la souris.

Il est aussi possible d'utiliser les trois premiers boutons de la barre d'outils de la carte : 

- |zoomfull| va repositionner la carte à la position et au niveau de zoom de départ.

- |zoomin| passe la souris en mode *zoom avant*. Dans ce mode, il n'est plus possible de déplacer la carte. Cliquer sur la carte avec la souris pour dessiner un rectangle.
L'application zoomera au plus près de ce rectangle. Un simple clic (pas de rectangle) zommera un niveau plus près.
  
- |zoomout| passe la souris en mode *zoom arrière* : un clic zoomera un niveau en arrière, centré sur le point cliqué.

Un dernier moyen pour zoomer en avant consiste à presser la touche *maj*, la maintenir pressée et cliquer avec la souris opur dessiner un rectangle. Cela peut se faire tout 
en restant en mode *déplacement*. C'est donc plus simple que de basculer en mode *zoom avant*.


.. index:: pair: Pan; Control
.. index:: pair: Move; Control

Déplacement
```````````

Le mode par défaut, activé au démarrage de l'application.

Choisir |pan| pour basculer en mode *déplacement*. Dans ce mode, pour bouger la carte, cliquer sur la carte, garder le bouton de souris pressé, et déplacer la souris. 
Puis relâcher le bouton.


.. _query_layers:

.. index:: pair: Query; Control
.. index:: pair: Query; Layer

|featureinfo| Interroger des calques
------------------------------------

Sélectionner |featureinfo| pour basculer en mode *interrogation*. En mode *interrogation*, cliquer quelque part sur la carte retournera les valeurs des calques 
actifs en ce point. 
Seuls les calques cochés *et* identifiés comme interrogeables (voir :ref:`layers_icons`) seront interrogés.

L'interrogation peut prendre un peu de temps à répondre, car la requête est faite sur le serveur cartographique.

Le résultat est ensuite affiché dans une fenêtre pop-up : 

- sur la gauche sont listés tous les calques qui ont retourné des valeurs. Souvent, un même calque apparaît plusieurs fois : cela signifie qu'il a retourné plusieurs valeurs
  (ce qui arrive souvent lorsqu'on a cliqué près d'une intersection de polygones, par exemple, ou sur un group de opints rapprochés). Parfois, un calque n'apparaît pas du tout, 
  lorsqu'il n'a aucun élément à l'emplacement interrogé.
  
- à droite sont affichés les informations (données) pour le résultat sélectionné à gauche. Sélectionnez un autre calque, les informations se mettront à jour immédiatement.

L'emplacement interrogé sur la carte est marqué par une croix |query_marker|.

.. figure:: querying.png

   Les deux calques sont marqués interrogeables dans l'onglet *Organiser*. Interroger la carte sur un lieu où les deux calques ont des données (un polygone pour le calque 
   Natural Parks) retourne une valeur pour le calque Natural Parks et deux pour le calque Land Use (le clic a dû se faire près d'une frontière entre deux polygones).

Pour sortir du mode *interrogation*, le plus simple est de revenir en mode *déplacement*.

.. index:: pair: Measure; Control

|measure_line| Mesurer
----------------------

Le bouton |measure_line| est en fait un bouton en deux-étapes, plus un menu qu'un bouton. 
Cliquer sur le bouton lui-même activera l'outil *Mesurer une distance*. Mais en cliquant sur le |icon_submenu| juste à droite du bouton, cela ouvrira un sous-menu
permettant de choisir entre les outils *Mesurer une distance* (|measure_line|) ou *Mesurer une surface* (|measure_area|).

Les deux outils fonctionnent de façon similaire.

Pour mesurer une distance, sélectionner |measure_line| et dessiner une ligne sur la carte : chaque clic gauche ajoutera un point. A partir de deux points, ecla forme une
ligne et la mesure correspondante est affichée. Un double clic met fin à la mesure.

Mesurer une surface se fait de la même manière : à partir du 3e point, ça forme un polygone et la surface du polygone est affichée.

.. figure:: measuringSurface.png

   Mesure de la surface d'une zone inondable.


.. index:: pair: History; Control

|history_prev| |history_next| Historique
----------------------------------------

En utilisant les boutons |history_prev| et |history_next|, vous pouvez revenir en arrière / avant dans les vues de la carte (zoom + position) que vous avez naviguées, un peu
comme avec les flèches d'historique de votre navigateur web.


.. index:: pair: Save (map); Control
.. index:: pair: Restore (map); Control

|savewmc| |loadwmc| Sauvegarder/restaurer la carte
--------------------------------------------------

Vous pouvez sauvegarder la configuration de la carte, pour réutilisation ultérieure. Cela vous permet de suspendre une session de travail puis de la restaurer 
ultérieurement, de sorte à reprendre là où vous en étiez. Ou d'envoyer le fichier à un collègue, qui pourra alors restaurer le même environnement que celui
sur lequel vous travaillez.

Cette fonction utilise le protocole WMC (*Web Map Context*). C'est une façon standardisée de stocker la composition d'une carte.

Sauevgarder la carte se fait avec le bouton |savewmc|. Le navigateur vous proposera de sauvegarder un fichier doté d'une extension cml. C'est le fichier de sauvegarde, 
qui contient les informations nécessaires pour restaurer la composition cartographique. Stockez-le quelque part sur votre ordinateur, ou envoyez-le aux personnes avec qui 
vous voulez partager votre carte.

Restaurer la composition se fait avec le bouton |loadwmc|, en sélectionnant le fichier sur son ordinateur et en appuyant sur le bouton *Charger*. Choisir *Fusionner* 
ajoutera les calques à votre carte actuelle. *Charger* remplacera la carte actuelle par la carte sauvée.