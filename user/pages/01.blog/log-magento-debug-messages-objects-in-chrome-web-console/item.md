---
title: "Log Magento debug (messages, objects) in Chrome Web Console"
published: true
date: 04/11/2013 11:00pm
taxonomy:
    category: blog
    tag: [magento, chrome, logging]
---

An homemade Magento plugin for logging anything you want in the Chrome console. a.k.a the Magento's console.log()

===

Developers always need to visually debug their code by using cowboy methods like **var_dump** or **print_r**. And that's the way it works with Magento.

Your only choices to output a debug is by using these tedious functions or by using the - not so practical - **Mage::log** core function.

This new extension, Magento Chrome Logger ease the debug process by rendering your info, warn & error messages directly into the Chrome Web Developer Console. Oh and full object dumps too !

This extension is based on the work of [Craig Campbell](http://craig.is) and his library [ChromeLogger](http://craig.is/writing/chrome-logger).

All you need to do is :

1. Install the Chrome extension from [Chrome Store](https://chrome.google.com/extensions/detail/noaneddfkdjfnfdakjjmocngnfkfehhd)
2. Install the Magento module from [GitHub](https://github.com/gmoigneu/magento-chromelogger) and enable it.
3. Click the extension icon in the browser to enable it for the current tab's domain

You can now output messages and dumps from your views & controllers :

    $consolelog = Mage::helper('consolelog');

    // Messages
    $consolelog::info('This is an info log message');
    $consolelog::warn('This is a warning log message');
    $consolelog::error('This is an error log message with a stacktrace', Exception $e);

    // Dump full objects
    $consolelog::log($product);
    

Check out the code or fork it at : 
    
    https://github.com/gmoigneu/magento-chromelogger
    

**Happy Magento debugging !**