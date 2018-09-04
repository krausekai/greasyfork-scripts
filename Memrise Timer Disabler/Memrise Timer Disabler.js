// ==UserScript==
// @name           Memrise Timer Disabler
// @description    Disables the Timer on Memrise.com
// @match          http://*.memrise.com/*
// @match          https://*.memrise.com/*
// @version        0.2.2
// @grant          none
// @namespace      https://greasyfork.org/users/3656
// ==/UserScript==

function callback() {
	MEMRISE.garden._events.pause[0]();
	MEMRISE.garden.session.timer.countdown = false;
	MEMRISE.garden.$speedbg[0] = "";
	//MEMRISE.garden.$speedtimer = {}
}
var observer = new MutationObserver(callback);
var config = { attributes: true, childList: true, subtree: true };
observer.observe(document.body, config);