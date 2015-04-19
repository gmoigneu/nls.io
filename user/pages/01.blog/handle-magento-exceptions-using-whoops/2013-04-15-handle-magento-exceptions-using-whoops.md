---
title: "Handle Magento Exceptions using Whoops"
published: true
date: 04/15/2013 11:00pm
taxonomy:
    category: blog
    tag: [magento, exception, whoops]
---

Whoops, the PHP error reporter of Laravel is a great tool. Let's use it with our beloved Magento !

===

I've been actively using [Whoops](https://github.com/filp/whoops) - php errors for cool kids - on spare projects and it definitely changed the way I managed PHP exceptions.

Laravel 4 has integrated it four days ago : [Integrate Whoops into the core of the framework error handling](https://github.com/laravel/framework/commit/64f3a79aae254b71550a8097880f0b0e09062d24) and it may be the best feature in the last month of Laravel 4 development.

But as a Magento developer, I wondered how Whoops could be integrated. So here is a little neat module to handle all your Magento exceptions using Whoops :

{<1>}![WhoopsMagento](http://nls.io/files/magento-whoops2.jpg)

Code is available as usual on GitHub : [https://github.com/gmoigneu/magento-whoops](https://github.com/gmoigneu/magento-whoops).

Feel free to contribute to it.

## Roadmap 

1. Handle the Whoops library requirements better
2. Push a new branch using Whoops as a composer dependency
3. Push a new branch to make the plugin installable through [modman](https://github.com/colinmollenhour/modman) and [magento-composer-installer](https://github.com/magento-hackathon/magento-composer-installer)

## Usage

Install and just set your developper mode to true :)

    Mage::setIsDeveloperMode(true); 
    
## Requirements

Should be working on every Magento version available.

Have fun debugging your Magento instance :)