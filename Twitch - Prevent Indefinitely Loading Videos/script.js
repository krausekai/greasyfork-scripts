// ==UserScript==
// @name         Twitch - Prevent Indefinitely Loading Videos
// @namespace    TwitchPreventIndefLoad
// @description  Continue to play videos that indefinitely load due to high CPU usage
// @version      1.1
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/*
// @match        https://*.twitch.tv/*
// @run-at       document-end
// ==/UserScript==

var spinCount = 0;
var lastSpinTime = Date.now();
var baseTimer = 1000;
var timer = 1000;

function preventSpinner() {
	setInterval(() => {
		var spinner = document.getElementsByClassName("pl-loading-spinner")[0];
		var play = document.getElementsByClassName("qa-pause-play-button")[0];
		if (spinner && play) {
			//rateLimit to every 5 seconds
			var currentSpinTime = Date.now();
			var difference = (currentSpinTime - lastSpinTime) / 1000;
			if (difference < 5) {
				return;
			}
			lastSpinTime = Date.now();

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