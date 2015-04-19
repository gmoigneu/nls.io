---
title: "Setup mailparse extension on ZendServer"
published: true
date: 12/07/2014 11:00pm
taxonomy:
    category: blog
    tag: [zend, php, mailparse]
---

As you may have notice, `pecl/mailparse` requires `mbstring` to compile. Even if `mbstring`is loaded you may get an error.

===

Here is a quick workaround :

	wget http://pecl.php.net/get/mailparse-2.1.6.tgz
	tar xvzf mailparse-2.1.6.tgz
	mkdir mailparse-2.1.6/ext/
	wget https://github.com/php/php-src/archive/PHP-5.5.16.zip
	unzip PHP-5.5.16.zip
	cp -rf php-src-PHP-5.5.16/ext/mbstring mailparse-2.1.6/ext/
	cd mailparse-2.1.6
	
Open `mailparse.c` and delete the following lines :

	/* just in case the config check doesn't enable mbstring automatically */
	#if !HAVE_MBSTRING
	#error The mailparse extension requires the mbstring extension!
	#endif
	
Exit your editor and compile the extension :

	/usr/local/zend/bin/phpize
	./configure --with-php-config=/usr/local/zend/bin/php-config
	make
	sudo make install
	
Add `extension=mailparse.so` in your `/usr/local/zend/etc/php.ini`

Restart the server !