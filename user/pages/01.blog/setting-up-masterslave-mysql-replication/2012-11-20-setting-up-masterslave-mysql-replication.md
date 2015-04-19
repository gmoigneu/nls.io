---
title: "Setting up Master/Slave MySQL replication"
published: true
date: 11/20/2012 11:00pm
taxonomy:
    category: blog
    tag: [sysadmin, mysql, scalability]
---

If you need to load balance MySQL read access on multiple servers, here is a quick how-to to setup a master/slave MySQL cluster.

===

## Our setup

* elrond : MySQL Master
* arwen : MySQL Slave

## 1. Configure your servers

On the master server, edit my.cnf to add these lines :

<pre><code>server-id               = 1
log_bin                 = /home/log/mysql/mysql-bin.log
expire_logs_days        = 10
max_binlog_size         = 100M
</code></pre>

On the slave server, edit my.cnf to add these lines :

<pre><code>server-id               = 2
log_bin                 = /home/log/mysql/mysql-bin.log
expire_logs_days        = 10
max_binlog_size         = 100M
</code></pre>

The <code>server-id</code> values should be unique on all connected servers.

Restart both servers

## 2. Copy your data

Launch your MySQL command-line and lock your tables :

<pre><code>mysql> FLUSH TABLES WITH READ LOCK;</code></pre>

Stop your slave server:

<pre><code>root@arwen: /etc/init.d/mysql stop</code></pre>

Copy over your master data :

<pre><code>root@elrond: scp -r /var/lib/mysql/dbname root@arwen:/var/lib/mysql/</code></pre>

And binlogs : 

<pre><code>root@elrond: scp -r /home/log/mysql/ root@arwen:/home/log/mysql/</code></pre>

where <code>dbname</code> is your database name.

Change ownership of the newly created files :

<pre><code>root@arwen: chown -R mysql:mysql /var/lib/mysql
root@arwen: chown -R mysql:mysql /home/log/mysql</code></pre>

## 3. Activate the replication

Restart your slave MySQL instance : 

<pre><code>root@arwen: /etc/init.d/mysql start</code></pre>

On your master MySQL instance, check the master status :

<pre><code>mysql> SHOW MASTER STATUS;</code></pre>

It should return the log name and offset : 

<pre><code class="sql">mysql > SHOW MASTER STATUS;
+---------------+----------+--------------+------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+---------------+----------+--------------+------------------+
| mysql-bin.008 | 3250     | dbname       | mysql            |
+---------------+----------+--------------+------------------+
1 row in set (0.06 sec)
</code></pre>

Now set the master info your slave instance :

<pre><code class="sql">mysql> CHANGE MASTER TO
MASTER_HOST='elrond',
MASTER_USER='arwen',
MASTER_PASSWORD='**************',
MASTER_LOG_FILE='mysql-bin.008',
MASTER_LOG_POS=3250;

mysql> START SLAVE;
</code></pre>

Just reactivate your master write/read capabilities :

<pre><code class="sql">mysql> UNLOCK TABLES;</code></pre>

## 4. Monitor your replication

You can, at anytime, use slave and master status to check if everything going smooth :

On your master server :

<pre><code class="sql">mysql> SHOW MASTER STATUS;</code></pre>

On your slave one :

<pre><code class="sql">mysql> SHOW SLAVE STATUS;</code></pre>

And you're now all set.