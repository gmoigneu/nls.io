---
title: Setup gearman on Debian 7
date: 21:11:25 21/12/2014 
taxonomy:
    category: blog
    tag: [zend, php, gearman, libgearman]
---

Manually install gearman to be able to use the last version with the pecl extension

===

If you encounter the dreaded `configure: error: Please install libgearman` error, it's because the gearman package is out of date compared to the PECL extension.

Remove gearman if you need to :

	apt-get remove --purge gearman-job-server

First, install some needed libraries :

	sudo apt-get install libboost-all-dev gperf build-essential libevent-dev uuid-dev	

Download the latest gearman version :

	cd /tmp
	wget https://launchpad.net/gearmand/1.2/1.1.12/+download/gearmand-1.1.12.tar.gz
	tar xvzf gearmand-1.1.12.tar.gz
	cd gearmand-1.1.12


Compile & install gearman :

	./configure --prefix=/usr --with-boost-libdir=/usr/lib/
	make && sudo make install

You now should be able to install the PECL extension:

	pecl install gearman

Add it to your php.ini :

	extension=gearman.so

Restart your php or webserver daemon.

To start gearman, install it as a service or launch it in the background :

	gearmand -d -l /var/log/gearman.log