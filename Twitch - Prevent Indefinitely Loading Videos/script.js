// ==UserScript==
// @name         Twitch - Prevent Indefinitely Loading Videos
// @namespace    TwitchPreventIndefLoad
// @description  Continue to play indefinitely loading videos due to high CPU usage
// @version      1.0
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/*
// @match        https://*.twitch.tv/*
// @run-at       document-end
// ==/UserScript==

function preventSpinner() {
	setInterval(() => {
		var spinner = document.getElementsByClassName("pl-loading-spinner")[0];
		var play = document.getElementsByClassName("qa-pause-play-button")[0];
		if (spinner && play) {
			play.click();
			setTimeout(() => {
				play.click();
			}, 100);
		}
	}, 1000);
}

setTimeout(() => {
	preventSpinner();
}, 10000);