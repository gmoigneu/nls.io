---
title: "Magento module development with git & vagrant"
published: true
date: 03/10/2013 11:00pm
taxonomy:
    category: blog
    tag: [vagrant, sysadmin, magento]
---

Short how-to for configuring a Vagrant box dedicated for Magento module development without modman.

===

One of the most painfull task with Magento is developing community modules and managing them with Git without creating an ugly and complex .gitignore to handle other Magento resources.

Here is the way I work with that by extracting all modules files in another directory and symlinking all that I need.

## Setup base Magento project

1\. Download and unzip Magento

2\. Put your vagrant configuration int the Magento root

Check [https://github.com/gmoigneu/vagrant-lamp](https://github.com/gmoigneu/vagrant-lamp) for a default Magento Vagrant setup if you need one.

3\. Add symlinks capacity to your VM share :

In your Vagrantfile, add this line :

    config.vm.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
Without this extradata, VirtualBox can't use symlinks in shared folders.

4\. Vagrant Up !

Launch your Vagrant instance :
    $ vagrant up

5\. Create your database

Login to your instance and create your database :

    $ vagrant ssh
    $ mysql -u root -p
    mysql > CREATE DATABASE magento;
    mysql > GRANT ALL ON magento.* to magento@localhost IDENTIFIED BY 'magento';
    mysql > exit

6\. Install Magento

Run the CLI installer :

    $ /usr/bin/php -f install.php -- \
    \ --license_agreement_accepted "yes" \
    \ --locale "fr_FR" \
    \ --timezone "Europe/Paris" \
    \ --default_currency "EUR" \
    \ --db_host "localhost" \
    \ --db_name "magento" \
    \ --db_user "magento" \
    \ --db_pass "magento" \
    \ --url "http://magentotest.dev.net/" \
    \ --use_rewrites "yes" \
    \ --skip_url_validation "yes" \
    \ --use_secure "no" \
    \ --secure_base_url "" \
    \ --use_secure_admin "no" \
    \ --admin_firstname "Niels" \
    \ --admin_lastname "Nls" \
    \ --admin_email "n@nls.io" \
    \ --admin_username "niels" \
    \ --admin_password "yourpassword"

7\. Configure your local hosts to match vagrant IP address.

8\. Test your Magento setup

    $ open http://magentotest.dev.net/

## Create module arborescence

In order to git only our new module files, we need to put all our resources in a subfolder in the Magento root :

    $ mkdir modulename

You are now going to create all your files in this folder while keeping the Magento directory scheme :

    $ mkdir -p modulename/app/code/community/Nls/ModuleName/
    $ mkdir -p modulename/app/code/community/Nls/ModuleName/etc/
    $ mkdir -p modulename/app/etc/modules/
    $ touch modulename/app/code/community/Nls/ModuleName/etc/config.xml
    $ touch modulename/app/etc/modules/Nls_ModuleName.xml

Create the .xml content with the rules you need.

## Create symlinks

We are now going to symlink our dev folders to Magento working folders in order to have it load our module :

    $ ln -s /vagrant/modulename/app/code/community/Nls/ /vagrant/app/code/community/Nls
    $ ln -s /vagrant/modulename/app/etc/modules/Nls_ModuleName.xml /vagrant/app/etc/modules/Nls_ModuleName.xml

Magento should now be loading our module correctly.

## Git your module

Create a new repository in your module folder :

    $ cd modulename
    $ git init .
    $ git add .
    $ git commit -m "Initial directory creation"

You can now work on your files and manage them with Git without interfering the real Magento sructure.

## Notes

**Where do I put the README ?** That's a good question. I personnaly create one at the project root and a copy of it into my module component : ``` modulename/app/code/community/Nls/ModuleName/``` The README will be viewable on GitHut (or other services) by default but can easily be removed after.