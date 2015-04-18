---
title: Stop the WebRTC leak in Chrome 42+
date: 21:11:25 15/04/2015
taxonomy:
    category: blog
    tag: [webrtc, chrome, privacy]
---

Want to protect your real IP address when using a VPN and Chrome, **fix the WebRTC leak now** !

===

Head to [PrivacyTools.io Leak test](https://www.privacytools.io/webrtc.html) now and check if the page is displaying your real IP address or your local ones.

If so, there is now a way to protect this leak from happening in Chrome 42+.
 
* Open chrome://version/ in your URL bar and copy the Profile Path value
* Close all instances of Chrome. <span class="label label-danger">mandatory</span>
* In the finder or in Windows Explorer, navigate to the `Profile Path` folder
* Open the Preferences file with your favorite text editor
* At the bottom of the file, add the new option below :

```
"webrtc": {
   "multiple_routes_enabled": false
}
```

<p class="alert alert-danger">
    <span class="label label-danger">Warning:</span>
    Don't forget to add a `,` at the end of the previous line to respect json syntax.
</p>


Save the file and restart Chrome. Retry the [PrivacyTools.io Leak test](https://www.privacytols.io/webrtc.html). Your IP should now be hidden.