// ==UserScript==
// @name           Memrise Timer Disabler
// @description    Disables the Timer on watering & gardening levels in Memrise.com
// @match          http://*.memrise.com/*
// @match          https://*.memrise.com/*
// @version        0.1.5
// @grant          none
// @namespace https://greasyfork.org/users/3656
// ==/UserScript==
// Forked from http://userscripts-mirror.org/scripts/show/174879
// Corrected @match

var onLoad = function($) {
  $("div.garden-timer div.txt").bind("DOMSubtreeModified", function() {
    MEMRISE.garden.timer.cancel();
  });
};

var injectWithJQ = function(f) {
    var script = document.createElement('script');
    script.textContent = '$(' + f.toString() + '($));';
    document.body.appendChild(script);
};
injectWithJQ(onLoad);
