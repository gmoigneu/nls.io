---
title: "Install Kinect drivers and record audio on Mac OS X 10.9"
published: true
date: 03/23/2014 11:00pm
taxonomy:
    category: blog
    tag: [kinect, mac]
---

Microsoft Kinect may be the best "room" microphone out there for now. If you want to play with it on your Mac, let me explain you how to install the reckless drivers.

===

As I've been working on automating my home these last few weeks, I wanted to take a look at how I could have controlled my different appliances with my voice.

So I decided to bought a Kinect (for Xbox 360) and to start experimenting with it. It is meant to work on a Raspberry Pi but I chose to develop on my main OSX machine for now. Here is the Kinect driver setup procedure for Mac OS X 10.9.

## Prerequisites

1. You first need XCode and the command line tools. I assume you already got that.
2. Setup brew : http://brew.sh
3. Install XQuartz : https://xquartz.macosforge.org/landing/
4. Install the `freeglut` package to handle OpenGL : `brew install freeglut`
5. Install `sox` (optionnal - to mix in the 4 microphones channels) : `brew install sox`

## Compile the libfreenect package

    cd /tmp
    git clone https://github.com/OpenKinect/libfreenect.git
    cd libfreenect
    cmake -DBUILD_AUDIO=true
    make
    
## Install firmware & binaries

You should now have a nice `bin/` directory containing all your Kinect utilities. As the library needs to inject a proper firmware into the Kinect, we will run a basic command inside our current directory :

    bin/freenect-wavrecord
    
Send the `Ctrl-C` command to stop it.

Ok, we're ready to install our binaries :

    make install
    
Here you go. Everything ready.

## Record audio

You can use the freenect-wavrecord utility to record from the 4 microphones of the Kinect :

    freenect-wavrecord
    # Speak to it and Ctrl-C to finish the recording
    
You should now have four channelX.wav files. Mix them up with sox :

    sox -M channel1.wav channel4.wav recording.wav
    
You now got a clear recording of your voice.

## Next steps ...

Here are the 3 main points I'm looking into now :

- Automatically stop recording at the end of one command
- Convert the wav file to flac
- Use Google Speech to Text API to get the transcript in order to send it to a Rivescript bot.