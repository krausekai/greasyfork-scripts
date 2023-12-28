// ==UserScript==
// @name           Memrise Turbo's Timer Disabler
// @namespace      https://github.com/infofarmer
// @description    Disable the timer
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/water/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.1.15
// @updateURL      https://github.com/cooljingle/memrise-turbo/raw/master/MemriseTurbo.user.js
// @downloadURL    https://github.com/cooljingle/memrise-turbo/raw/master/MemriseTurbo.user.js
// @grant          none
// ==/UserScript==

// Reverse engineered from https://static.memrise.com/garden/dist/js/garden-bundle-d2538361f913.js

MEMRISE.garden.session_start = (function() {
	var cached_function = MEMRISE.garden.session_start;
	return function() {
		NoTimer();
		return cached_function.apply(this, arguments);
	};
}());

function NoTimer() {
	MEMRISE.garden.session.make_box = (function () {
		var cached_function = MEMRISE.garden.session.make_box;
		return function() {
			var result = cached_function.apply(this, arguments);
			result.getTimerLength = () => 0;
			return result;
		};
	}());
}
