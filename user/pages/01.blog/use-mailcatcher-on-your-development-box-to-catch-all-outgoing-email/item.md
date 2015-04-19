---
title: "Use mailcatcher on your development box to catch all outgoing emails"
published: true
date: 04/18/2013 11:00pm
taxonomy:
    category: blog
    tag: [sysadmin, mail, maicatcher]
---

A complete how-to for catching all outgoing emails with mailcatcher on Debian for your development projects 

===

While debugging emails on our projects, we often need to make many tests from our development server. The traditional method doesn't allow multiple developers to test it at the same time and sometimes emails get lost or spammed.

So we decided to use [MailCatcher](http://mailcatcher.me) on our dev boxes. 

Here we go :

## Setup Rubygems

Get the latest version on [rubygems.org](http://rubygems.org) :

    apt-get install ruby ruby-dev
    cd /tmp
    wget http://production.cf.rubygems.org/rubygems/rubygems-2.0.3.tgz
    tar xvzf rubygems-2.0.3.tgz
    cd rubygems-2.0.3

Quickly install rubygems :

    ruby setup.rb

Link the binary to the gem command


    ln -s /usr/bin/gem1.8 /usr/bin/gem

## Setup mailcatcher gem

    apt-get install sqlite3 libsqlite3-dev libsqlite3-ruby
    gem install mailcatcher -v 0.5.10

Launch the mailcatcher daemon :

    mailcatcher

## Configure an Apache proxy

    vim /etc/apache2/sites-available/mailcatcher.dev.net
    
Configure your vhost according to the domain you want to use :

    <VirtualHost *:80>
      ServerName mailcatcher.dev.net
      <Proxy *>
            Order deny,allow
            Allow from all
      </Proxy>
      ProxyRequests Off
      ProxyPassReverse / http://127.0.0.1:1080/
      ProxyPass / http://127.0.0.1:1080/
      ProxyPreserveHost Off
    </VirtualHost>
    
Enable mod_proxy and mailcatcher vhost :

    a2enmod proxy proxy_http
    a2ensite mailcatcher.dev.net
    apache2ctl restart
    
You now should be able to access mailcatcher interface at http://mailcatcher.dev.net

Don't forget to edit your hosts file if it's a development domain name.

## Route all your mail through mailcatcher

In order to use mailcatcher, you can configure your application to use the smtp address 127.0.0.1:1025 or configure it system-wide. We will be using postfix to relay all emails.

    apt-get install postfix
    vim /etc/postfix/main.cf
    
Edit the line :

    relayhost = 127.0.0.1:1025

And restart postfix :

    /etc/init.d/postfix restart
    
## Test mailcatcher

Generate a fake email from command line :

    mail -s "Mailcatcher Test" n@nls.io
    Test content
    [Ctrl+D]
    
You should now see your test email on mailcatcher interface :

![Mailcatcher](http://nls.io/files/mailcatcher.jpg)