.. _preface:.. _intro:
.. include:: ../substitutions.txt

Introduction
============

The |project| application is actually an extension over `GeoNetwork OpenSource <http://geonetwork-opensource.org>`_, a metadata catalog project, 
focusing on mapping features, backed by `GeoServer <http://geoserver.org>`_ map server software.

This documentation will thus intensively refer to GeoNetwork documentation, when dealing with metadata management, and to GeoServer documentation
when dealing about cartographic layers management.

|project| and |gn|
------------------

|gn| is a **metadata catalog** server application, offering limited mapping features. It has been recently enhanced with a *widget* capacity. This is a 
means to plug custom public interfaces on top of |gn| standard features.

The |project| makes use of this capacity and is build as a |gn| *widget*, extending the mapping capacity.

While the public interface is totally specific to the |project| project, and properly documented in its 
`User Manual <../../../../geoportal/build/html/index.html>`_,  the editor and administration parts are massively native |gn| software 
(and |gs| software as for the cartographic layers conception).

The main administration panel is thus the same as standard |gn|, except for the layertree management parts.


|project| and |gs|
------------------

As told before, |gn| deals with metadata management (and data cataloging), and |gs| deals with the cartographic layers creation. The layertree (part of 
this project's developments) makes the link.

|gs| is the piece of software that takes GIS data as input, and outputs them in an internet-usable format. It also processes legend and query requests, and 
some more complicated requests, as used in the Polygon Query tool.