.. _getting_strated:

.. include:: ../../substitutions.txt

Accessing the catalog and logging in
====================================

Accessing the catalog
---------------------

If you have performed a standard install on your computer, the default address of the home page is 
`http://localhost:8080/geonetwork/ <http://localhost:8080/geonetwork/>`_. 
Otherwise, you should use the address provided by the catalog's administrator.

.. _how_to_login:

About user profiles
-------------------

You can use the catalog without being registered. An unregistered user (anonymous user) can perform searches
and access all the public information available in the catalog.

To access to the non-public and the advanced functions of the catalog, you need to be granted some privileges.
Those privileges are handled in users and group profiles.
Here is a short list of the user profiles used by |project_name| (from the more privileged to the lesser):

- Administrator (administers the catalog - has all rights)
- Users administrator (administers a users' group)
- Reviewer (has the rights to publish -publicly- metadata sheets)
- Editor (can create, modify et remove his metadata sheets; he can publish them for the groups he belongs to)
- Registered user (can view restricted metadata and download restricted data)
- Anonymous user (unregistered : has access to all public information)

The rights/privileges attributed to each user profile are explored more in-depth in the administration chapter (cf. :ref:`user_profiles`).

Logging in
----------

To log in, one has to visit the home page and enter his user name and password in the login form 
on the top-right area, then click on the *Login* button.

.. figure:: login.png

   Logging form

Every user registered in the catalog belongs to one or more user groups, which gives him access
to the ressources that are specific to these groups.


Default administrator account
-----------------------------

By default on a freshly installed |project_name| instance, a default administrator account is created, which name and password are both "admin".
For security reasons, you really should change its password as soon as possible. You can do it in the Administration page.
