// ==UserScript==
// @name           Memrise Timer Disabler
// @description    Disables the Timer on watering & gardening levels in Memrise.com
// @match          http://*.memrise.com/*
// @match          https://*.memrise.com/*
// @version        0.1.6
// @grant          none
// @namespace      https://greasyfork.org/users/3656
// ==/UserScript==

var onLoad = function($) {
	$("div.garden-timer div.txt").bind("DOMSubtreeModified", function() {
		//MEMRISE.garden.timer.cancel();
		MEMRISE.garden._events.pause[0]();
	});
};

var injectWithJQ = function(f) {
	var script = document.createElement('script');
	script.textContent = '$(' + f.toString() + '($));';
	document.body.appendChild(script);
};
injectWithJQ(onLoad);
