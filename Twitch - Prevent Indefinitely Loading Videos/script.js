// ==UserScript==
// @name         Twitch - Prevent Indefinitely Loading Videos (VODs)
// @namespace    TwitchPreventIndefLoad
// @description  Continue to play videos that indefinitely load due to high CPU usage
// @version      1.2
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/videos/*
// @match        https://*.twitch.tv/videos/*
// @run-at       document-end
// ==/UserScript==

var spinCount = 0;
var lastSpinTime = Date.now();
var baseTimer = 1000;
var timer = 1000;

// Do not run if manually started
var manualStartTime = 0;
function manualStartTimeHandler() {
	manualStartTime = Date.now();
}
function manualStartTracker() {
	var difference = (Date.now() - manualStartTime) / 1000;
	if (difference < 5) return true;
	else return false;
}

// Main code
function preventSpinner() {
	setInterval(() => {
		console.log(manualStartTracker())
		if (manualStartTracker()) return;

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

			// Double click, delayed
			play.click();
			setTimeout(() => {
				play.click();
			}, 100);
		}
	}, 1000);
}

// Run after startup (5 seconds)
window.addEventListener("load", () => {
	setTimeout(() => {
		var play = document.getElementsByClassName("qa-pause-play-button")[0];
		play.addEventListener("click", manualStartTimeHandler);
		preventSpinner();
	}, 5000);
});