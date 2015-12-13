---
title: Deploying Magento 2 on Platform.sh
date: 12/12/2015 11:00pm
taxonomy:
    category: webdev
    tag: [php, sysadmin, platform.sh]
---

How to install & configure Magento2 to deploy it on the Platform.sh PaaS.

===

[Platform.sh](http://platform.sh) is a Platform-as-a-Service dedicated to hosting PHP applications like WordPress, Drupal or Symfony projects. Here is a quick tutorial on how to deploy the brand new Magento2 on it.

## 1. Prerequisites

- You should already have composer setup on your machine. If it's not the case, head to [Composer download page](https://getcomposer.org/download/)
- Make sure you have an account on the [Magento.com](http://magento.com) website. Once done, obtain your repository credentials under My Account > Developers > Secure Keys
- You should have a local php installation with mcrypt & intl extensions
- As we'll use Redis as a Storage Cache, install the redis php extension

## 1. Initialize the Magento project.

Launch your terminal and clone the Magento2 repository :

    composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition magento2demo
    cd magento2demo
    composer require predis/predis
    
You will be asked for your Magento credentials. Input them and store them in the `auth.json` composer file.

Init a new git repository into the newly created folder

    git init .
    
Create a new `.gitignore` file at the root of your project:

    var/*
    !var/.htaccess
    
    pub/media/*
    !pub/media/customer/.htaccess
    !pub/media/downloadable/.htaccess
    !pub/media/import/.htaccess
    !pub/media/theme_customization/.htaccess
    !pub/media/.htaccess
    
    app/etc/*
    !app/etc/di.xml
    !app/etc/NonComposerComponentRegistration.php
    !app/etc/vendor_path.php
    
    .DS_Store
    
As you can see there, I'm not ignoring the `vendor` directory and the libs will be added to the git repository. I usually avoid commiting the vendor folder but I did not succeed in handling the Magento repository credentials on Platform.sh. An alternative solution could be to setup a [Toran proxy](https://toranproxy.com/) to handle the authentification.

Add the newly created files to git :

    git add .
    git commit -m "Init magento2demo project"
    
## 2. Install the sample data package

    chmod +x bin/magento 
    bin/magento sampledata:deploy

You should get the `The 'https://repo.magento.com/packages.json' URL required authentication.` error. Launch an update and add the files to git:

    composer update
    git add .
    git commit -m "Add sample data"
    
We're now ready to proceed with the deployment

## 3. Create your Platform.sh project

Go to your account and create a new Platform. Choose the best region for your needs and validate your billing details if you're out the 30-day trial.

![Platform.sh account](https://nls.io/images/151212-1-Account.jpg)

Give a name to your project and choose the `Import your existing code` option.

In your terminal, add the remote to your git project :

    git remote add platform xxx@git.eu.platform.sh:xxx.git
    
**Before you can push to the Platform.sh repository, you need to configure your account's ssh keys except if you logged in through GitHub and you're GitHub have already been imported.**

## 4. Configuring the platform

The first step is to get the Platform.sh cli tool : 

    curl -sS https://platform.sh/cli/installer | php
    
Launch the `platform` tool and get your project id :

    platform
    
Once you get your id, initialize the project in your current git folder :

    platform local:init --project xxx
    cd .
    
Your project is now dispatched in three folders : `builds`, `repository` & `shared`.

## 5. Configuring the project

Platform.sh is auto-configured by configuration files located in your project. Let's create them. If you need any more details head to the well crafted [documentation](https://docs.platform.sh/).

### platform.app.yaml

    name: magento2demo
    type: php:5.6
    build:
        flavor: composer
    relationships:
        database: "mysql:mysql"
        redis: "redis:redis"
    runtime:
        extensions:
            - redis
            - xsl
            - json
    web:
        document_root: "/"
        passthru: "/index.php"
    mounts:
        "/public/pub/media": "shared:files/media"
        "/public/pub/static": "shared:files/static"
        "/public/pub/opt/magento/var": "shared:files/opt-var"
        "/public/var": "shared:files/var"
        "/public/app/etc": "shared:files/etc"
    disk: 2048
    crons:
        cronrun:
            spec: "*/1 * * * *"
            cmd: "public/bin/magento cron:run"
        cron:
            spec: "*/1 * * * *"
            cmd: "public/update/cron.php"
        cronsetup:
            spec: "*/1 * * * *"
            cmd: "public/bin/magento setup:cron:run"

    
### .platform/services.yaml

    mysql:
        type: mysql:10.0
        disk: 1024
    redis:
        type: redis:2.8
        
Note that we're using MariaDB 10 as Magento2 requires MySQL 5.6.

### .platform/routes.yaml

    "http://{default}/":
      type: upstream
      upstream: "magento2demo:php"
    "http://www.{default}/":
      type: redirect
      to: "http://{default}/"

Commit those configurations :

    git add .
    git commit -m "Add platform config files"
    
Check that the project is building by executing :

    platform local:build

## First deployment

We're now pushing our first version to the platform.sh master environment

    cd repository
    git push -u platform master
    
## Magento installation

SSH into your environment :

    platform environment:ssh
    
Get your MySQL credentials :

    echo $PLATFORM_RELATIONSHIPS| base64 --decode
    
Adapt the Magento CLI install command with your MySQL details and base-url:

    cd public
    ./bin/magento setup:install \
    --admin-user="niels" \
    --admin-email="your@email" \
    --admin-password="YourPassword999" \
    --base-url="http://xxx.eu.platform.sh" \
    --db-host="xxx" \
    --db-name="main" \
    --db-user="user" \
    --use-rewrites=1 \
    --session-save="db" \
    --admin-use-security-key=0 \
    --timezone="Europe/Paris" \
    --admin-firstname="Your Name" \
    --admin-lastname="LastName" \
    --cleanup-database
    
<p class="alert alert-danger">
    <i class="fa fa-warning"></i>
Remember the Magento Admin URI given at the end of the process !
</p>

That will install Magento2 & the sample data packages. The last step is to generate all Magento2 frontend assets. On your environment ssh and copy sample media files : 

    ./bin/magento setup:static-content:deploy
    cp -R vendor/magento/sample-data-media/* pub/media/
    
Go to your environment url (aka base-url) and voilà ! You can also login to your backend through the Admin URI shown before.

![Platform.sh account](https://nls.io/images/151212-2-Magento.jpg)

<p class="alert alert-danger">
    <i class="fa fa-warning"></i>
You can find the whole repository here : https://github.com/gmoigneu/magento2-platformsh
   </p> 