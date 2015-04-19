---
title: "Laravel 4 : 1103 Incorrect table name '' error while migrating"
published: true
date: 04/13/2013 11:00pm
taxonomy:
    category: blog
    tag: [laravel, orm]
---

A quick fix for Laravel 4 database config generating a 1103 Incorrect table name error.

===

L4 commit : [503ba024119103f8840f503cb8f5e8e2492a05ec](https://github.com/laravel/laravel/tree/503ba024119103f8840f503cb8f5e8e2492a05ec)

While creating migrations for a new project, I encountered this strange error while launching the migrate command :

    [Exception]
    SQLSTATE[42000]: Syntax error or access violation: 1103 Incorrect table name '' (SQL: create table `` (`migration` varchar(255) not null, `batch` int not null) default character set utf8 collate utf8_unicode_ci) (Bindings: array (  ))
    
After 20 minutes of browsing the framework core files, I discovered that the <code>MigrationServiceProvider</code> needed a configuration item named : <code>$table = $app['config']['database.migrations'];</code>

So let's add it to your <code>database.php</code> config file :

    'migrations' => 'migrations',
    ...
    'default' => 'mysql',
    
Initialize your migrations and run them :

    /mnt/hgfs/projets/twitter-pics(branch:develop*) » php artisan migrate:install                                                                       
    Migration table created successfully.
    ------------------------------------------------------------
    /mnt/hgfs/projets/twitter-pics(branch:develop*) » php artisan migrate 
    Migrated: 2013_04_13_102313_create_users_table
    Migrated: 2013_04_13_102400_create_tweets_table
    
And you're done !