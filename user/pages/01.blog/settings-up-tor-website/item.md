---
title: "Setting up a Tor website on Debian with nginx or Apache"
published: true
date: 04/26/2015 11:00pm
taxonomy:
    category: blog
    tag: [tor, sysadmin, nginx]
---

A quick how-to on hosting a website through Tor with nginx or Apache.

===

First, set up a brand new Debian Wheezy box and harden it as much as possible !

Install & configure Apache or nginx as you would normally do.

Add the tor project repository :

```
gpg --keyserver keys.gnupg.net --recv 886DDD89
gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -
apt-get update
```

Install the Tor service : 

```
apt-get install tor deb.torproject.org-keyring
```

We are now going to route the 80 Tor port to our webserver:

```
echo '' > /etc/tor/torrc
vim /etc/tor/torrc
```

In the file, add the following content : 

```
DataDirectory /var/lib/tor
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
```

Save, close & restart Tor :

```
service tor restart
```

Find your hidden hostname :

```
cat /var/lib/tor/hidden_service/hostname
```

Mine is for example `npdkxyvpw3rk7uib.onion`

In your webserver vhost file, add your hostname :

For nginx :

```
servername nls.io npdkxyvpw3rk7uib.onion;
```

For Apache, add a ServerAlias directive :

```
ServerName nls.io
ServerAlias npdkxyvpw3rk7uib.onion
```

Restart your webserver :

```
service nginx restart
service apache restart
```

*Fire up the [Tor Browser](https://www.torproject.org/projects/torbrowser.html.en) and voila !*


