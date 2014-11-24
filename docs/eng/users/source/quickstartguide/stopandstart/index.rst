.. _stopandstart:
.. include:: ../../substitutions.txt

Start/stop the catalog
======================

Start and open the catalog
--------------------------

If you are running Windows, menus should be available for start and stop actions:

- Go to Start\>All Programs\> |project_name| \>Start server to start |project_name|  Web server (named Jetty).

- Go to Start\>All Programs\> |project_name| \>Open |project_name|  to open |project_name|'s home page in your browser. 
Or just open the following page with your browser: `http://localhost:8080/geonetwork/ <http://localhost:8080/geonetwork/>`_


Alternatively, you can also start it manually, by going in the catalog's installation folder, **bin subfolder**, 
and execute start-|project_name|.bat if your are running Windows,
or start-|project_name|.sh if you are running Mac or Linux.


*Example : start geonetwork using the command line*

::

    cd /installation/folder/of/geonetwork
    cd bin
    ./start-geonetwork.sh


**Tips:**    

- Your firewall may ask if you agree Oracle Java to execute some code. It is very likely that it is your server starting, so say yes !

- A console will run in the background (you can see it in the programs bar). D'ont close it, since it is your server running.


Stop the catalog
----------------

The recommended way to stop the catalog is to go to Start\>All Programs\> |project_name| \>Stop server.

Alternatively, you can also stop it manually, by going in the catalog's installation folder, **bin subfolder**, 
and execute stop-|project_name|.bat if your are running Windows,
or stop-|project_name|.sh if you are running Mac or Linux.

Closing the console window should also work.