---
title: "Setup Ghost with nginx on Debian"
published: true
date: 09/21/2013 11:00pm
taxonomy:
    category: blog
    tag: [ghost, nginx]
---

A quick tutorial to setup Ghost on a Debian server with nginx acting as a reverse-proxy.

===

#1. Setup node.js

Update and install dependencies :

    sudo apt-get update
    sudo apt-get install git-core curl build-essential openssl libssl-dev
  

Get the node.js source :

    cd /tmp
    git clone https://github.com/joyent/node.git

List all versions available. I'll be using 0.11.7 but due to the sqlite package restrictions, you will maybe have to use 0.11.0

    git tag
    git checkout 0.11.7
    
Compile node.js :

    ./configure && make && make install
    /tmp # node -v
    v0.11.7
    /tmp # npm -v
    1.3.8

#2. Install Ghost

Create a new user and get Ghost (will be installed in */home/ghost/*) :

    useradd ghost
    su ghost
    cd
    wget https://en.ghost.org/zip/ghost-0.3.0.zip
    unzip ghost-0.3.0.zip
    mv ghost-0.3.0/* .

#3. Configure Ghost

Prepare Ghost dependencies :

    npm install --production
  
Edit config.js with your settings :

    vim config.js
  
Don't forget to change the blog address !

#4. Configure the node daemon tool forever

In order to secure our node.js server instance, we will be using forever :

    npm install -g forever
  
Start the server :

    NODE_ENV=production forever start index.js

If you want to kill the server, just use :

    forever list
    forever stop 0 # if of Ghost process
  
Or 

    forever stopall
  
You should now be able to access Ghost on `http://<your-ip>:2368`

#5. Setup nginx as a reverse proxy

    apt-get install nginx
  
Configure /etc/nginx/nginx.conf :

    user www-data;
    worker_processes 4;
    pid /run/nginx.pid;
    
    events {
      worker_connections 768;
      # multi_accept on;
    }
    
    http {
    
      ##
      # Basic Settings
      ##
    
      sendfile on;
      tcp_nopush on;
      tcp_nodelay on;
      keepalive_timeout 65;
      types_hash_max_size 2048;
      # server_tokens off;
      # server_names_hash_bucket_size 64;
      # server_name_in_redirect off;
    
      include /etc/nginx/mime.types;
      default_type application/octet-stream;
    
      ##
      # Logging Settings
      ##
    
      access_log /var/log/nginx/access.log;
      error_log /var/log/nginx/error.log;
    
      ##
      # Gzip Settings
      ##
    
      gzip on;
      gzip_disable "msie6";

      gzip_vary on;
      gzip_proxied any;
      gzip_comp_level 6;
      gzip_buffers 16 8k;
      gzip_http_version 1.1;
      gzip_types text/plain text/css application/json application/x-javascript text/xml application/    xml application/xml+rss text/javascript;

      ##
      # Virtual Host Configs
      ##

      include /etc/nginx/conf.d/*.conf;
      include /etc/nginx/sites-enabled/*;
    }
  
And create the Ghost virtualhost */etc/nginx/sites-enabled/ghost* :

    server {
      listen         80;
      server_name <your-blog-address>;
      root /home/ghost/;
      index index.php;

      if ($http_host != "<your-blog-address>") {
         rewrite ^ http://<your-blog-address>$request_uri permanent;
      }

      location / {
        proxy_set_header X-Real-IP  $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:2368;
      }
     
      location ~* \.(?:ico|css|js|gif|jpe?g|png|ttf|woff)$ {
        access_log off;
        expires 30d;
        add_header Pragma public;
        add_header Cache-Control "public, mustrevalidate, proxy-revalidate";
        proxy_pass http://127.0.0.1:2368;
      }

      location = /robots.txt { access_log off; log_not_found off; }
      location = /favicon.ico { access_log off; log_not_found off; }

      location ~ /\.ht {
          deny all;
      }
    }

Restart nginx :

    nginx -t && nginx -s reload
  
#6. Create your Ghost user

Just go to `http://<your-blog-address>/ghost/signup`