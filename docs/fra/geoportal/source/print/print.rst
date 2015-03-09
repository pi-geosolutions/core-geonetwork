.. _print:
.. include:: ../substitutions.txt


.. index:: PDF, Print

Printing
========

The printing function allows to generate a PDF page with an extract from the map, title, comments and legend.
This PDF page can then be easily printed, sent, or integrated in larger documents.

.. figure:: printed.png

   Print output, first page
   
Print tab
---------

Printing is controlled from the *Print* tab. It contains a form in which you can define the title, the comments to incorporate 
and several parameters. 

Simultaneously, an orange square box should appear on the map. It represents the extent that will be taken in consideration while printing. 
The box automatically centers on the map center. Its size is determined by the Scale field. By default and when the map refreshes, the portal tries
to optimize the box's size to the current view.

.. figure:: print_form.png

   Print form on the left, orange extent box overlaid on the map.

A *Generate PDF* button, on the bottom, triggers the document's production. It may take a moment, since the document's generation 
is made on the server and requires to process the active layers.

Then, the browser should output a PDF file, to open in a PDF viewer or save to the disk.

.. note:: As stated in the Print tab, Google and Bing backgrounds can't be used for the printing. This is due to licence restrictions from those companies, 
          allowing the use for view, but not for export/print. 
          
          It is therefore advised to use another background (OpenStreetMap works fine) or any overlay that will cover the background.