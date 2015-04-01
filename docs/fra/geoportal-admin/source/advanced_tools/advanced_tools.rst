.. include:: ../substitutions.txt
.. |dashboard| image:: dashboard.png
.. |qmark| image:: windows_qmark.png
.. |fi| image:: icon_featureinfo.png
.. |pan| image:: icon_pan.png
.. |pquery| image:: polygon_query_16px.png

.. _advanced_tools:

Outils d'interrogation avancés
==============================

Deux outils permettent d'aller plus loin en termes d'interrogation des données : 

*   *Interrogation avancée* est une amélioration de l'outil d'interrogation standard (l'outil |fi| dans la barre d'outils de la carte)
    dont le but  principale est de reformater l'affichage des réqsultat d'interrogation pour les rendre plus "user-friendly".

*   InterrogationPolygonale est un nouvel outil dont l'objectif est de pouvoir calculer des statistiques de base sur une surface définie par l'utilisateur. Il
    ne s'appliquera que sur certains calques raster spécifiques, comme par exemple la donnée Afripop.

Interrogation avancée
---------------------

Présentation
~~~~~~~~~~~~

Cette amélioration remplace l'outil d'interrogation standard. Il s'agit de l'outil que l'on peut activer en cliquant sur le bouton |fi| dans la barre d'outils de la carte : 
cela bascule la souris en mode interrogation. Tant que vous êtes dans ce mode, lorsque vous cliquez sur la carte, cela déclenchera une interrogation, aux coordonnées 
cliquées, sur les calques actuellement visibles sur la carte. 
*Donc, pour utiliser l'outil d'interrogation, vous devez avoir un ou des calques affichés sur la carte,,et cliquer en un lieu où se trouvent des données.*

.. note:: Pour quitter le mode interrogation, vous pouvez cliquer sur le bouton |pan| à sa gauche. Cela vous remettra en mode "déplacement" (bouger la carte).

La requête retournera un résultat pour chaque entité située aux coordonnées cliquées, ce qui signifie que vous pouvez obtenir plusieurs résultats pour un même 
calque : si vous cliquez sur une limite entre deux polygones par exemple, vous récupérerez tous les polygones concernés par cette limite.

.. figure:: at1.png

   Comment fonctionne l'interrogation

.. note:: Une chose importante à noter est que seuls les calques marqués comme interrogeables seront interrogés. Cela ne se passe pas du côté du géoportail 
   mais plutôt dans la définition de la couche WMS, dans le serveur cartographique (Géoserver par défaut).
   
**L'outil d'interrogation standard**, en réponse à une interrogation, affiche une table de champs représentés sous forme d'une **liste de paires ID/valeur**, les IDs étant 
souvent des codes, plus destinés à l'utilisation dans une base de données que pour la lecture par l'être humain.

**L'outil d'interrogation avancée**, lui, affiche une table sous forme d'une **liste étiquette/valeur**. Les étiquettes étant éditables via une interface qui permet de définir, 
pour chacun de ces IDs précédemment mentionnés, une **étiquette différente pour chaque langue disponible**. Il permet même de masquer certains des champs.

.. figure:: at2.png

   Résultat comparatif. Gauche : résultats avec l'outil standard. Droite : résultats formattés par l'outil avancé.
   
Fonctionnalités
~~~~~~~~~~~~~~~

Couches interrogeables
^^^^^^^^^^^^^^^^^^^^^^

.. figure:: at3.png
   :scale: 50 %
   :align: right

   Définir une couche comme interrogeable, dans GeoServer.
   
De ce côté, rien de changé. Mais il est important de bien clarifier le rôle joué par chaque élément de la configuration : 
l'outil ne pourra interroger que les couches définies comme interrogeables. Cela se configure depuis le serveur cartographique, GeoServer par défaut.
Cela se passe, dans GeoServer, au moment de la configuration d'une couche carto. Par défaut, GeoServer déclare la couche comme interrogeable, mais cela peut se décocher.

Les calques graphiques (charts), étant des données complexes et composites, ne sont pas interrogeables.

Traduction
^^^^^^^^^^

La traduction des étiquettes est l'objectif principal de cet outil. Le premier niveau de traduction consiste à passer des IDs (destinés à une base de données)  à des
étiquettes faciles à lire.
Le second niveau consiste à proposer des étiquettes adaptées à chaque langue proposée par le système.

L'outil permet de traduire le contenu dans chacune des langues supportées. Comme pour l'instant seuls Anglais et Français sont actifs, ces deux langues sont les deux 
seules disponibles.

La traduction des étiquettes se fait de façon indépendante pour chaque langue. Vous pouvez par exemple traduire vers des étiquettes esthétique pour le Français seulement,
mais conserver les codes bruts pour l'Anglais. Ou cacher des éléments différents selon la langue utilisée.

Cacher des éléments
^^^^^^^^^^^^^^^^^^^

Il est effectivement possible de cacher des champs, parmi les résultats : lorsque les responsables SIG produisent de la donnée géographique, certains des attributs peuvent 
être très techniques, réservés à un usage très spécifique que vous ne voulez pas proposer au sein de portail.

Cacher un tel champ se fait tout simplement, en lui donnant la valeur ``#hide#`` en guise de traduction.

Gérer les attributs
~~~~~~~~~~~~~~~~~~~

.. figure:: at4.png
   :scale: 50 %

   Accéder au gestionnaire d'attributs

Pour l'instant, nous avons vu des fonctionnalités mais pas comment y accéder. Voilà comment faire : 

* Premièrement, vous devrez être connecté avec un profil *Administrateur*.

* Ensuite, effectuez une interrogation standard sur la couche à configurer (voir l'illustration dans le chapitre Présentation).
  Vous noterez un bouton qui n'es pas présent lorsqu'on agit comme utilisateur simple sans privilèges : dans l'angle en haut à droite, un bouton
  appelé *Gérer les attributs*. Cliquer sur ce bouton ouvrira le Gestionnaire d'attributs pour le calque actuellement affiché (calque sélectionné
  dans la partie gauche de la fenêtre d'interrogation).
  
* Dans le Gestionnaire d'attributs, sélectionnez d'abord la langue (anglais par défaut), puis commencez à traduire les champs : 
  à gauche est l'ID du champ, à droite l'étiquette. Cliquez sur l'étiquette pour l'éditer. Appuyez sur *Entrée* quand vous avez fini.
  
.. figure:: at5.png
   :scale: 50 %
   :align: right

   Gérer les attributs.

Formattage des étiquettes
^^^^^^^^^^^^^^^^^^^^^^^^^

Changer une étiquette est aussi simple, donc, que cliquer dessus, taper le texte, et appuyer sur la touche *Entrée*.

Mais il est aussi possible d'appliquer des règles de formattage simples, en utilisant les balises HTML de base : 

*   gras: inclure le texte entre les balises ``<b>`` et ``</b>``

*   italique: inclure le texte entre les balises ``<i>`` et ``</i>``

*   souligné: inclure le texte entre les balises ``<u>`` et ``</u>`` 

*   texte de couleur : inclure le texte entre les balises ``<font color="red">`` et ``</font>``
    pour le rendre rouge (par exemple)


.. figure:: at6.png

   Quelques exemples de formattage HTML des étiquettes.


Cacher un champ
^^^^^^^^^^^^^^^

.. figure:: at7.png
   :scale: 50 %
   :align: right

   Cacher un champ.


Cacher un champ est très simple : lui donner ``#hide#`` comme étiquette. Cela se fait indépendamment pour chaque langue.

Tester en direct (non-persistant)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Vous pouvez facilement tester les résultats avant de sauver les changements : 
You can easily test the result before saving:

* Editer les étiquettes.

* Déplacer le Gestionnaire d'attributs sur un côté ou le fermer. 

* Cliquer sur la carte pour réaliser une nouvelle interrogation. Le résultat devrait prendre en compte vos nouveaux changements.

* Rouvrir le Gestionnaire d'attributs et ajuster les étiquettes si elles ne vous conviennent pas.

* Recommencer l'interrogation

* Etc.

* Quand c'est bon, sauvez les changements.

.. warning:: Tant que vous n'avez pas sauvé les changements, votre travail n'est pas persisté : c'est actualisé en "live" dans votre navigateur, mais pas 
   sauvé sur le serveur. Ce qui signifie que si vous rechargez la page, vous perdrez tout changement non sauvegardé.
   
   Remarquez que c'est aussi le moyen de réinitialiser des changement malheureux : pas besoin d'un bouton *annuler* : il suffit de recharger la page dans votre
   navigateur.

Sauvegarder les changements
^^^^^^^^^^^^^^^^^^^^^^^^^^^

En bas du Gestionnaire d'attributs, il y a deux boutons de sauvegarde. Vous pouvez, au choix : 

* Sauvegarder les changements couche par couche : vous faites vos changements, puis sauvez, puis faites des changements sur une autre couche, etc.

* Sauver les changements pour une session de travail complète : comme tous les changements sont stockés dans le navigateur, vous pouvez choisir de travailler
  successivement sur plusieurs couches et de tout sauver en une seule fois à la fin. Dans ce cas, vous choisirez l'option *Sauver tous les changements*.

Considérations techniques
~~~~~~~~~~~~~~~~~~~~~~~~~

Accès concurrent à la base de données
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Comme expliqué précédemment dans la documentation du |lt|, un accès concurrent sur la base de données en écriture peut causer des soucis. 

Chaque outil stockant des données dans une base  de données est sensible à cette problématique. Parfois, il s'agit un problème critique, comme dans le cas du
|lt|, puisque cela pourrait conduire à la perte d'informations importantes.

Pour cet outil, en revanche, on ne risque pas de perdre beaucoup. Et comme l'accès concurrent à la base de données est quelque chose d'assez rare (l'outil 
n'est disponible que pour les profils *Administrateur*, et la traduction est un processus simple, rapide, qu'on ne fait qu'une fois), nous avons estimé qu'il
ne valait poas la peine de gérer cette éventualité. Soyez cependant informé que cela peut arriver.

Résilience réseau
^^^^^^^^^^^^^^^^^

Ce problème est beaucoup plus sensible : dans les cas où le réseau est peu fiable, les problèmes de résilience réseau doivent être traités.
C'est le cas pour cet outil, de deux façons : 

* lorsqu'on écrit dans la base de données, en encapsulant les requêtes SQL dans un bloc COMMIT/ROLLBACK. Cela nous garntit l'intégrité des données stockées dans la base :
  si tout se passe bien, les données sont stockées. En cas d'échec, rien n'est changé, ce qui est toujours mieux qu'un mix entre les données nouvelles et les 
  données anciennes.
  
* supposons que votre connection internet soit interrompue alors que vous travaillez sur vos traductions. Vous n'avez pas eu le temps de sauver les changements.
  Comme les changements sont déjà stockés localement dans votre navigateur, vous avez juste à vous assurer de ne pas recharger la page tant que la connection internet
  n'est pas revenue. Et là, vous pouvvez sauver les changements en cliquant sur *Sauver tous les changements*.
  Voir la section *Résolution de problèmes* pour plus de détails sur ce scenario.


Problèmes connus
^^^^^^^^^^^^^^^^

Aggrégations de couches
"""""""""""""""""""""""

Une aggrégation de couches est une fonctionnalité proposée notamment par GeoServer, permettant de combiner ensemble plusieurs couches simples pour en réaliser une plus complexe.
A cause de la façon dont GeoServer les gère, il n'est pas possible de réaliser un affichage esthétique avec eux : lorsqu'on réalise une interrogation sur 
une aggrégation de couches, le résultat est liste les couches de façon indépendante, sans tenir compte de l'aggrégat, qui n'est même pas visible. Et du côté du client web,
nous n'avons aucun moyen de savoir de quels résultats la couche aggrégat est composée.
 
Par conséquent, étendre la fonctionnalités aux aggrégations de couches nécessiterait de réaliser de nombreuses requêtes, ce qui résulterait en une surcharge en termes
de consommation de bande passante internet. 

La bande passante étant une des préoccupations principales, nous avons décidé de ne pas travailler sur l'intégration des aggrégations de couches, qui sont d'ailleurs 
assez peu fréquentes.

Tel quel, si vous interrogez une aggrégation de couches, l'outil d'interrogation chargera et affichera les résultats bruts des couches de l'aggrégat. 
Si vous ne voulez pas que cela se passe ainsi, vous pouvez toujours faire en sorte que l'aggrégat se compose de couches définies (dans GeoServer) comme non-interrogeables,
en conséquence de quoi l'aggrégat ne le sera pas non-plus).

Résolution de problèmes
~~~~~~~~~~~~~~~~~~~~~~~

J'ai perdu ma connexion internet avant de pouvoir sauvegarder les changements
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Pas de panique ! Vraiment. Avant tout, **ne rechargez pas la page**.

* Dans la mesure où les changements sont déjà stockés localement dans le navigateur, vous devez juste vous assurer de ne pas recharger la page tant que vous n'avez pas
  récupéré votre connexion internet.
  
* Attendez que votre connexion internet se rétablisse, puis ouvrez à nouveau le géoportail dans un nouvel onglet (ou fenêtre) de votre navigateur. 
  Vérifiez que vous êtes toujours connecté. Sinon, identifiez-vous à nouveau avec votre profil *Administrateur*
  
* Revenez à votre première fenêtre du géoportail, celle où vous avez édité les étiquettes.

* Cliquez sur *Sauver tous les changements*.

* Revenez à l'autre fenêtre et essayez une interrogation sur une des couches éditées. Vérifiez que les changements ont bien été sauvés (vérifier depuis la première 
  fenêtre ne marcherait pas, puisque c'est les changements stockés en interne qui risqueraient d'être utilisés).
  
  Ca devrait être OK. Sinon, vérifiez à nouveau que vous êtes bien identifié avec un profil *Administrateur* et que votre réseau internet marche bien...

Je ne peux pas interroger un calque !
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Vérifiez les points suivants : 

#. Est-ce que le calque est affiché sur la carte ?
   Il doit l'être. Si le calque est décoché, il ne sera pas interrogé.

#. S'agit-il d'un calque graphique (*chart*). Les *charts* ne sont pas interrogeables.

#. Peut-être avez-vous cliqué sur un point de la carte où le calque ne présente pas de données. Si le calque n'a pas de données en ce point, aucun résultat ne sera
   retourné.

Si vous n'avez pas trouvé votre réponse ici, alors il est probable que le calque a été défini comme non-interrogeable, dans sa configuration dans le serveur cartographique.


Dans la fenêtre Interrogation de couches cartographiques, à gauche, certaines des lignes sont en blanc
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Voir *Aggrégations de couches*, dans le chapitre *Considérations techniques*.



.. |10000000000000420000002008059F76_png| image:: images/10000000000000420000002008059F76.png
    :width: 1.134cm
    :height: 0.55cm


.. |100000000000073F00000217376DCE46_png| image:: images/100000000000073F00000217376DCE46.png
    :width: 17.6cm
    :height: 5.075cm


.. |10000000000000470000001E15B90C19_png| image:: images/10000000000000470000001E15B90C19.png
    :width: 1.131cm
    :height: 0.478cm


.. |10000000000000420000001A30DF0EBB_png| image:: images/10000000000000420000001A30DF0EBB.png
    :width: 1.196cm
    :height: 0.471cm


.. |1000000000000048000000214C6C849F_png| image:: images/1000000000000048000000214C6C849F.png
    :width: 1.154cm
    :height: 0.529cm


.. |10000000000000460000001ECE99DE80_png| image:: images/10000000000000460000001ECE99DE80.png
    :width: 1.189cm
    :height: 0.51cm


.. |10000000000000460000001E4AF278FA_png| image:: images/10000000000000460000001E4AF278FA.png
    :width: 1.154cm
    :height: 0.496cm


.. |10000000000004DE0000019AF1DFF19F_png| image:: images/10000000000004DE0000019AF1DFF19F.png
    :width: 15.365cm
    :height: 5.055cm


.. |10000000000000470000001D7DCB0A45_png| image:: images/10000000000000470000001D7DCB0A45.png
    :width: 1.154cm
    :height: 0.471cm



.. |1000000000000777000002EE40EB3623_png| image:: images/1000000000000777000002EE40EB3623.png
    :width: 17.6cm
    :height: 6.907cm


.. |1000000000000700000002BF55217514_png| image:: images/1000000000000700000002BF55217514.png
    :width: 17.6cm
    :height: 6.904cm
    