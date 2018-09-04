// ==UserScript==
// @name           Memrise Timer Disabler
// @description    Disables the Timer on Memrise.com
// @match          http://*.memrise.com/*
// @match          https://*.memrise.com/*
// @version        0.2.1
// @grant          none
// @namespace      https://greasyfork.org/users/3656
// ==/UserScript==

function callback() {
	MEMRISE.garden.$speedtimer = null;
	MEMRISE.garden._events.pause[0]();
}
var observer = new MutationObserver(callback);
var config = { attributes: true, childList: true, subtree: true };
observer.observe(document.body, config);