---
title: "Handle multiple Magento websites or stores with nginx"
published: true
date: 12/19/2014 11:00pm
taxonomy:
    category: blog
    tag: [webdev, magento, nginx]
---

A quick tip to show you how to configure nginx vhost for a multiple url Magento webshop.

===

As you know, Magento init his website or store in the index.php file :

 
    /* Store or website code */
    $mageRunCode = isset($_SERVER['MAGE_RUN_CODE']) ? $_SERVER['MAGE_RUN_CODE'] : '';

    /* Run store or run website */
    $mageRunType = isset($_SERVER['MAGE_RUN_TYPE']) ? $_SERVER['MAGE_RUN_TYPE'] : 'store';

    Mage::run($mageRunCode, $mageRunType);


So we have to set these $_SERVER variables depending on the domain name (or the subdomain) that nginx receives.

In your nginx website config file (e.g. : /etc/nginx/sites-enables/magento.dev.net) add a nginx map listing your websites and codes. This map should be placed outside the server block :

 
    map $http_host $magecode { 
      magento.dev.net fr;
      magento.dev.co.uk uk;
      magento.dev.es es;
    }


PS : Don't forget to add these in your local hosts files if they are fake development domains !

Now, if you're using php-fpm, you should have a block like this :

     
    location ~ \.php$ {
      fastcgi_pass   127.0.0.1:9000;
      fastcgi_index  index.php;
      fastcgi_connect_timeout 7200;
      fastcgi_send_timeout 7200;
      fastcgi_read_timeout 7200;
      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;

      fastcgi_param  QUERY_STRING       $query_string;
      fastcgi_param  REQUEST_METHOD     $request_method;
      fastcgi_param  CONTENT_TYPE       $content_type;
      fastcgi_param  CONTENT_LENGTH     $content_length;

      fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
      fastcgi_param  REQUEST_URI        $request_uri;
      fastcgi_param  DOCUMENT_URI       $document_uri;
      fastcgi_param  DOCUMENT_ROOT      $document_root;
      fastcgi_param  SERVER_PROTOCOL    $server_protocol;

      fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
      fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;

      fastcgi_param  REMOTE_ADDR        $remote_addr;
      fastcgi_param  REMOTE_PORT        $remote_port;
      fastcgi_param  SERVER_ADDR        $server_addr;
      fastcgi_param  SERVER_PORT        $server_port;
      fastcgi_param  SERVER_NAME        $server_name;

      # PHP only, required if PHP was built with --enable-force-cgi-redirect
      fastcgi_param  REDIRECT_STATUS    200;
    }


Just add these 3 parameters in the block and modify MAGE\_RUN\_TYPE depending on whether you use websites or stores.

 
    fastcgi_param MAGE_IS_DEVELOPER_MODE 1;
    fastcgi_param MAGE_RUN_TYPE website;
    fastcgi_param MAGE_RUN_CODE $magecode;


Reload your nginx configuration and ta-da, your websites/stores change with the domain requested !