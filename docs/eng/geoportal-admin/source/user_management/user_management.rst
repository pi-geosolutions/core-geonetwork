.. include:: ../substitutions.txt

.. _user_management:

Users management
================

Users management is a pure |gn| native function, except for |gs| usage (see :ref:`gs_user_profiles`).

GeoNetwork uses the concept of Users, Groups and User Profiles.

- A User can be part of one or more Groups.

- A User has a User Profile.

- A User can only have one User Profile associated.

The combination of User Profile and Group defines what tasks the User can perform on the system or on specific metadata records.


Groups
------

.. note:: To be able to edit and create new groups, one must have an *Administrator* profile.

Groups are used to gather people by affinity. Usually in a geocatalog, people will be grouped by organization or administrative structure. 
Groups allow to categorize the data and the access rights. For example, a data that is internal to NDMA may not be rendered public, even to other Government agencies. 
It may be decided to give access to only the metadata sheet (but not the data itself) to other Government agencies, in order to advertise that the data exists and whom 
to contact to know more ; but to keep it secret from public, unauthorized users.

This is what groups are made for. 

See the `groups documentation <http://geonetwork-opensource.org/manuals/2.10.4/eng/users/admin/usersandgroups/index.html#creating-new-user-groups>`_ on |gn| documentation.

User Profiles
-------------

.. figure:: dummyUser.png
   :scale: 50 %
   :align: right

   Fake Jean Pommier user's profile.

.. note:: To be able to manager Users profiles, one must have at least a *Users Administrator* profile.

Users profiles are an extension of this principle: a given User has a unique User profile, that will define his credential level for each of the groups 
defined for the catalog.

A given User may be registered, for instance, as a User Administrator profile for the GBOS group, but as mere Reviewer for the NDMA group. 
This allows for fine access and edition control.


See the `User Profiles documentation <http://geonetwork-opensource.org/manuals/2.10.4/eng/users/admin/usersandgroups/index.html#creating-new-users>`_ on |gn| documentation.

Ownership and privileges
------------------------

.. _ownership:

Ownership
`````````

The original creator of a metadata is set as its owner. The owner is consider the referent person about this metadata.

The owner can be changed by transferring the ownership on one or more metadata.

Transfer Ownership
``````````````````

This may happen mostly when someone quits his job: the metadata he used to manage must be cared by someone else. 
In order for this to be properly conducted, it is necessary to transfer the ownership on these metadata to the new caretaker.

.. note:: ownership transfer is available at the *Users Administrator* level or above

See the `ownership transfer <http://geonetwork-opensource.org/manuals/2.10.4/eng/users/managing_metadata/ownership/index.html#transfer-ownership>`_ on |gn| documentation.


.. _privileges:

Privileges
``````````

Privileges are the reason behind the Groups structure: it is possible, for a given metadata, to give different access rights to each group.

See the `privileges <http://geonetwork-opensource.org/manuals/2.10.4/eng/users/managing_metadata/ownership/index.html#setting-privileges-on-a-metadata-record>`_ on |gn| documentation.

.. note:: The privileges on a metadata can be set either by the owner of this metadata, by any *Reviewer* or *Users Administrator* on the group the metadata belongs to, or any *Administrator*. 
