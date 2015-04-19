---
title: "mysqldump all databases except ..."
published: true
date: 04/13/2013 11:00pm
taxonomy:
    category: blog
    tag: [mysql, dump]
---

Avoid exporting mysql, test or any database in a mysql server dump.

===

When migrating MySQL database from a server to another you can rsync all binary files or get an SQL dump of all databases you want.

In this very case, you generally want to omit databases like :

* mysql
* text
* performance_schema
* information_schema

In order to do so, here a little trick you can use :

1\. Extract the databases names :

    echo 'show databases;' | mysql -u root -p<password> > databases.txt

2\. Edit databases.txt and remove the unwanted ones
3\. Dump the desired databases :

    cat databases.txt | xargs mysqldump -u root -p<password> --databases > mysqldump.sql

And there your are. A neat SQL dump with only the databases you need.