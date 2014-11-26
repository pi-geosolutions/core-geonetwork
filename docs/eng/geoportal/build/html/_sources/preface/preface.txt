.. _preface:.. _preface:
.. include:: ../substitutions.txt

Preface
=======

The interactive web site for Risk Management, described in this documentation, is born from cutting-edge, open-source, cartographic tools. It was built using several open-source components 
known for their seriousness : GeoNetwork (on-line cataloging software), GeoServer (web map server), OpenLayers (web mapping library) bound with ExtJS/GeoExt 
(Javascript high-level framework), and PostgreSQL/PostGIS as database.

The result is more a software than a web site. Let's say an on-line software. This kind of software is usually called a Geoportal. In the following chapters, 
we will call it the |project|, or simply Geoportal.

It has been developed on World Bank's initiative.

A new concept
=============

Geoportals are a recent concept, and still not completely grown up. They answer to a need for secure and organized storage for geospatial data, and usually offer 
some tools to manipulate the stored data: search, view, etc.

Historically, geoportals are two-part tools: 

- A mapping component, in which the user can display geospatial data in an online dynamic interface. This is common-case that people don't go further. 
  The second part is more for advanced users : 
  
- A cataloging component, usually separated from the first one. Its role is to give storage and search facilities for documents, including geospatial ones. 
  It occurs to be the most important part.
  
  This is in fact a kind of library cataloging software. The informations sheets it uses are called metadata.
  
The  |project| features a new concept, combining those tools in a unique portal.
It brings several advantages, such as : 

- Better and easier interaction between catalog and dynamic map :
 
  * Geospatial data stored in the catalog can be added to the map by a simple click.
  
  * The search results are directly displayed over the map.
  
  * The map geospatial overlays are constantly connected with their metadata, and you can consult them at any moment.
  
- Common tools are developed once only.

- Mutualized computer coding, resulting in lighter solution and easier updates.

- A unique interface, simpler access.

This makes the Geoportal a true **Information System**, rich and complete.
