---
title: "Optimize nginx and PHP-FPM (max_children)"
published: true
date: 04/05/2013 11:00pm
taxonomy:
    category: blog
    tag: [nginx, fpm]
---

A quick way of calculating the number of children your nginx process should create & handle to avoid a server burnout.

===

As [Apache MaxClients](http://nls.io/post/how-do-i-calculate-apache-maxclients-), PHP-FPM needs to be optimized to avoid taking your server down.

## nginx

Configuring nginx is pretty easy and is described everywhere. For this article, we'll be just focusing on workers.

You should set your worker_process to the number of CPU cores available :

    ~ # cat /proc/cpuinfo| grep processor                                                                                             
    processor    : 0
    processor    : 1
    processor    : 2
    processor    : 3

In your nginx.conf file :    

    worker_processes 4;
    
You should now edit the worker_connections variable. It's the number of simultaneous requests nginx can handle per worker. So a 1024 value allows me to handle 4096 requests. That should be more than enough. This value mostly depends on your bandwidth capacity and not on your server resources as these requests are extremely lightweight.


## PHP-FPM

Here are the three main settings you should know about when configuring your pool (note that I'm using only one pool to handle all sites on the server but you can dispatch resources according to your needs) :

### 1\. pm

The pm variable should be set to dynamic instead of static:

    pm = dynamic
    
By doing so, PHP-FPM processes are started only when needed instead of staying in memory.

### 2\. pm.max_children

pm.max_children is really the most important setting in your configuration. It should be calculated by doing :

    pm.max_children = (total RAM - RAM used by other process) / (average amount of RAM used by a PHP process)
    
For example : My [awesome RamNode KVM VPS](https://clientarea.ramnode.com/aff.php?aff=299) has 1Gb RAM available and the system and MySQL could use up to 300Mb. I'm hosting Bolt and WordPress sites that consumes around 15Mb during page load. My pm.max_children would be set like this :

    (1024 - 300) / (15) ~= 48

### 3\. pm.servers

Other variables should be set to one third of pm.max_children. Like this :

    pm.start_servers = 10 
    pm.min_spare_servers = 10
    pm.max_spare_servers = 10
    
The last thing to take into account is the pm.max_requests settings. It's the number of requests a process server can handle before respawing. You should set this value to high values like 200.

    pm.max_requests = 200
    
Don't forget to restart PHP-FPM after you've changed your settings.

## Benchmark !

With these settings, I can now launch a basic ab performance test on a WordPress site without any cache enabled :

    ~ # ab -c 100 -n 3000 http://wordpress.nls.io/
    
We can observe amazing results :

    Concurrency Level:      100
    Time taken for tests:   41.534 seconds
    Complete requests:      3000
    Failed requests:        0
    Write errors:           0
    Total transferred:      32421000 bytes
    HTML transferred:       31668000 bytes
    Requests per second:    72.23 [#/sec] (mean)
    Time per request:       1384.452 [ms] (mean)
    Time per request:       13.845 [ms] (mean, across all concurrent requests)
    Transfer rate:          762.30 [Kbytes/sec] received
    
72.23 requests per second handled by PHP-FPM is pretty good for such a small server. Most of the time needed for the requests is by waiting for a slot to be opened by PHP-FPM because I launched two times more concurrent requests than available PHP-FPM processes. But no errors or timeout were detected.

Have fun with nginx and PHP-FPM !