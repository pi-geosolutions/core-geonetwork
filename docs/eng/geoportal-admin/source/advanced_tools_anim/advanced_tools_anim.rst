.. include:: ../substitutions.txt
.. |dashboard| image:: dashboard.png
.. |qmark| image:: windows_qmark.png
.. |anim| image:: animation.png
.. |fb| image:: fb.png
   :scale: 75 %
.. |b| image:: b.png
   :scale: 75 %
.. |pb| image:: pb.png
   :scale: 75 %
.. |pause| image:: pause.png
   :scale: 75 %
.. |pf| image:: pf.png
   :scale: 75 %
.. |f| image:: f.png
   :scale: 75 %
.. |ff| image:: ff.png
   :scale: 75 %
.. |pquery| image:: polygon_query_16px.png

.. _advanced_tools_anim:
    
Animations tool
===============

Some data are meaningful only if one can browse them in their temporal dimension. The Temporal Profiles tool gives one way of exploring these data. Another way is to play animations. Like it is usually done with cloud weather data.

A “player” has been implemented for such use: the animations tool.

Each dataset that can be used with this tool is configured by an administrator. The simple user can select the dataset to animate, load it, and play the animation, either backward or forward, or step-by-step.

Public interface
----------------

One can activate the tool by clicking the button on the right of the Temporal Profiles tool (map top toolbar).

|10000000000004DE0000019AF1DFF19F_png|

A window pops up. You first have to choose the dataset you want to animate and then load it (click on the
*Load*
button).

A progress bar will keep you informed on the loading status: all data have to be loaded before you can start playing the animation. This allows for more fluidity afterwards.

If you load the dataset for the first time, it may take some sime. Afterwards, it should be quite straightforward, since the data are cached in the browser.

When the dataset has finished loading, the second half of the window gets accessible: the player part, composed of:

*   A slider, telling you where you are on the dataset. It starts on the last image (for meteo data, the current meteo).



*   A field telling you the date associated with this image.



*   A row of buttons for animation control.



You can play the animation, either by moving the slider, or using the animation control buttons.

|100000000000073F00000217376DCE46_png|

Animation control buttons
~~~~~~~~~~~~~~~~~~~~~~~~~

This is a 7 buttons row:

*   |10000000000000470000001E15B90C19_png|
    moves to the first (oldest) image. If an animation is running, it will move to the first image, but will not stop the animation (for this, use the pause button).



*   |10000000000000420000001A30DF0EBB_png|
    moves to the previous image.



*   |10000000000000420000002008059F76_png|
    backward animation button: loops over the images, playing backward. The animation will keep playing until you press the pause button (or the forward animation button, which will revert the play).



*   |10000000000000470000001D7DCB0A45_png|
    pause button: this will stop any animations in play.



*   |1000000000000048000000214C6C849F_png|
    forward
    animation button: loops over the images, playing forward. The animation will keep playing until you press the pause button (or the backward animation button, which will revert the play).



*   |10000000000000460000001E4AF278FA_png|
    moves to the next image.



*   |10000000000000460000001ECE99DE80_png|
    moves to the last (the more recent) image. If an animation is running, it will move to the last image, but will not stop the animation (for this, use the pause button).



Animation map layer
~~~~~~~~~~~~~~~~~~~

When you start playing the images, a new layer is added in the Organize tab, with the dataset's name. You can use it as any other map layer : play on opacity, curtain settings, visibility,reorganize with other layers, etc.

If you close the animation window, the layer is kept visible. This allows you to use it without having to keep this window around. If you want to remove the layer, simply unckeck it, or remove it (right-click, choose
*remove*
).

.. warning:: Be aware that if you close the window while an animation is playing, it will keep playing. To stop it from playing, open the animation tool again, and press the
   *pause* button.

Configuration
-------------

Configuring a new animation is not likely to happens often, so the configuration is server-side and need reloading the geoportal afterwards.
Two files are concerned: config-pigeo.xml and config-pigeo-animations.xml, both of them situated in the WEB-INF folder of the geoportal webapp.

**To apply your settings, you will have to reload the webapp, so this is a System Administrator task.**

config-pigeo.xml
~~~~~~~~~~~~~~~~

This is where general animations services configuration resides.
**Normally, it has only to be set once, at the geoportal's setup  and should not be changed afterwards, unless you have good reasons to !**

This is where you must set the base path to the animations data (please note that it must be common for all animations data) and the files' extension (usually it would be PNGs).

Look for the Animations services area. the two service to set are called
``pigeo.animations.listfiles``

and
``pigeo.animations.listfiles.json``

The
*ext*
parameter should not need adjusting : PNG files is probably what you want, since you wouldn't get transparency otherway.


   .. code-block:: xml
   
      <!-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -->
        <!-- Animation services                                           -->
        <!-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -->
      <service name="pigeo.animations.listfiles">
         <class name="fr.pigeosolutions.geoportal.services.animations.ListFiles">
            <param name="basePath" value="geoportal/animations/"/>
            <param name="ext" value="png"/>
         </class>
      </service>
      <service name="pigeo.animations.listfiles.json">
         <class name="fr.pigeosolutions.geoportal.services.animations.ListFiles">
            <param name="basePath" value="geoportal/animations/"/>
            <param name="ext" value="png"/>
         </class>
         <output sheet="pigeo/geoportal/tojson.xsl" contentType="application/json; 
         charset=UTF-8"/>
      </service>
      <service name="pigeo.animations.getimage">
         <class name="fr.pigeosolutions.geoportal.services.animations.GetImage" />
         <error id="file-not-found" sheet="error-embedded.xsl" statusCode="404">
            <xml name="error" file="xml/file-not-found-error.xml" />
         </error>

         <output file="true" />
      </service>
      
      
      <service name="pigeo.animations.list">
         <output sheet="pigeo/geoportal/listAnimations.xsl" contentType="text/xml; 
         charset=UTF-8">
            <xml name="animations" file="WEB-INF/config-pigeo-animations.xml" 
            localized="false" />
         </output>
      </service>
      
*The Animation services configuration in config-pigeo.xml*
   

Setting the basePath parameter
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The basePath parameter may need some change, to make it fit with the server's organization.

This is the place where the datasets' folders for animation will be placed.

It can be either relative or absolute path:

*   ``<param name="basePath" value="geoportal/animations/"/>``  will relate to your
    Geonetwork data directory. Say the Geonetwork data directory is ``~/tomcat7/data/gm-risk-gn2_10-datadir``, the basePath will them point to ``~/tomcat7/data/gm-risk-gn2_10-datadir/geoportal/animations/``, meaning you will place the datasets folders in there.



*   ``<param name="basePath" value="/home/large/geoportal/animations/"/>`` on the other way, starts with a /, and then is an absolute path.




config-pigeo-animations.xml
~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is where you set the datasets that will be made available for the animations tool.

To add a new dataset, you have to add a new <dataset> block. The best way is to copy an existing block and adjust the values.

Here are the XML tags to fill:

<id>
^^^^

This is the folder's name, as you will find it in the basePath folder (see config-pigeo.xml). If it doesn't match, the dataset won't be found. It is better to use plain filesystem names, with no special chars nor space.

label
^^^^^

This is the label that will be shown in the datasets' list, in the Animation tool window. It will also be used to name the layer in the Organize tab, when the tool is activated. Any string is accepted.

SRS
^^^

This says the coordinate system used for the bounds (see next)

geographicbounds
^^^^^^^^^^^^^^^^

Since our dataset contains plain png files, it is necessary to tell the system where to position the files. This is done using the bounds declaration.

A good way to get them is, if you generate the PNGs from a geographic format (say geotiff), to use gdalinfo command to get the bounds. Be sure the SRS tag is set accordingly to these bounds.

imagesize
^^^^^^^^^

Tells the size, in pixels, of the image.

timestampformatter
^^^^^^^^^^^^^^^^^^

This is a bit tricky. This allows to create the
*date*
timestamp (in the Animations window) from the files names. Say your files are named like
``mpe_141121_0432.png``, the 6 first digits being the date, the 4 last ones being the time.
You would like a more comprehensive display, like ``2014-11-21 T 04:32``.

This transformation will be done using the
*timestampformatter*
. This is plain javascript. Any javascript expression should work. Mostly, you are expected to use string processing functions. In the present example,

   .. code-block:: xml
   
      <timestampformatter>
        "20"+filename.substr(4,2)+"-"+filename.substr(6,2)+"-"+filename.substr(8,2)
        +" T "+filename.substr(11,2)+":"+filename.substr(13,2)
      </timestampformatter>
   
would to the trick.



   .. code-block:: xml
   
      <?xml version="1.0" encoding="UTF-8"?>
      <!-- 
       Define here parameters specific for animations application 
       (weather animations)
       <timestampformatter> : javascript function that builds the 
       time stamp out of the file name (use variable 'filename')
       example :   filename          mpe_140917-1402.png
                   timestampformatter  "20"+filename.substr(4,2)+"-"
                        +filename.substr(6,2)+"-"+filename.substr(8,2)
                        +" T "+filename.substr(11,2)+":"+filename.substr(13,2)
         gives timestamp      2014-09-17 T 14:02                              
      -->
      <animations>
       <!-- List of the available DBs (connection must be properly defined in 
       config-override-dev/prod.xml -->
       <datasets>
         <dataset>
            <id>eumetsat</id> <!-- must match the data folder name-->
            <label>Eumetsat meteo</label>
            <SRS>EPSG:4326</SRS>
            <geographicbounds>
               <minlon>-30.0093561</minlon>
               <minlat>-35.0062377</minlat>
               <maxlon>54.9937605</maxlon>
               <maxlat>36.0168419</maxlat>
            </geographicbounds>
            <imagesize>
               <width>1514</width>
               <height>1265</height>
            </imagesize>
            <timestampformatter>
            "20"+filename.substr(4,2)+"-"+filename.substr(6,2)+"-"
            +filename.substr(8,2)+" T "+filename.substr(11,2)+":"+filename.substr(13,2)
            </timestampformatter>
         </dataset>
       </datasets>
      </animations>

*config-pigeo-animations.xml configuration file. Only one dataset is configured for now.*
      
      
Animation temporal extent
~~~~~~~~~~~~~~~~~~~~~~~~~

The animation temporal extent is set very simply: the tool uses all the data present in the folder. The extent is thus set externally, in the scripts that will generate the images and put them in the folder. By removing old images at the same time you add new ones, you keep your time extent. This way, everything is possible, without complicated configuration.

Technical considerations
------------------------

Bandwidth usage optimisation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This tool has been developed with that perspective in mind:

*   using dedicated images, optimized in terms of size and weight, it minimized the first load.



*   u
    sing browser cache, the images, when already loaded, are kept in storage, and re-used. You should not have to load them twice, unless the browser cache is emptied. Thus, the next loads shloud be very quick.






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
    