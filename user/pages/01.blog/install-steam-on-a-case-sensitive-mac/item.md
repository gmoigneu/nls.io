---
title: "Install Steam on a Case-Sensitive Mac"
published: true
date: 03/30/2014 11:00pm
taxonomy:
    category: blog
    tag: [steam, mac]
---

Have you ever tried to run Steam on a case-sensitive Mac Os X system ? Here is a little tip to let us, developers, play on Steam using a dmg image.

===

Many of Mac users are running their systems on a case-sensitive drive for multiple reasons.

During installation, Steam greats you with a neat "Steam can't be installed on a case-sensitive filesystem".

We're going to bypass these checks by fooling Steam with an image sparsebundle.

## Create a storage image file

1. Launch Disk Utility
2. Create an Image on clicking "New Image"
3. Setup the image like this :

![Image Disk](http://static.nls.io/image.png)

Note that the image must be lowercase as Steam automatically lower every path it encouters. Mine will be `steam.dmg`.

An image file won't use the size you input in the wizard. Only the needed space will be consumed. Feel free to put 50Go or 100Go there depending on the number of games you got.

## Create fake folders in the image

    ln -s /Volumes /volumes
    cd /volumes/steam
    mkdir -p Steam/Applications
    mkdir -p Steam/Library/Application\ Support/Steam
    mkdir -p Steam/Documents/Steam\ Content
    
## Create symlinks to fool Steam

    ln -s /volumes/steam/Steam/Library/Application\ Support/Steam ~/Library/Application\ Support/Steam
    ln -s /volumes/steam/Steam/Documents/Steam\ Content ~/Documents/Steam\
    
## Install Steam

1. Move the downloaded Steam.app file into your volume /Applications folder
2. Launch it !

## Further notes

Many Mac games you Mono (.NET Framework for \*nix). You can download it here : http://www.go-mono.com/mono-downloads/download.html
