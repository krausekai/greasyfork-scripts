// ==UserScript==
// @name        Twitter Desktop to Twitter Mobile Redirector
// @namespace   TwitterDesktopToMobile
// @description Redirect the Twitter desktop website to the mobile website
// @author      Kai Krause <kaikrause95@gmail.com>
// @match       http://twitter.com/*
// @match       https://twitter.com/*
// @version     1.0
// @grant       none
// ==/UserScript==

var loc = location.href;
loc = loc.replace("twitter.com", "mobile.twitter.com");
location.replace(loc);
