// ==UserScript==
// @name         Youtube: Spacebar to Play/Pause Videos
// @namespace    ytSpacePauseKK
// @description  Force bind the spacebar to play/pause videos
// @version      1.6
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.youtube.com/*
// @match        https://*.youtube.com/*
// @exclude      https://*.youtube.com/embed/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

let cachedMode = "";
document.addEventListener("keydown", function onEvent(e) {
	if (e.code !== "Space") return;

	let ae = document.activeElement;
	if (ae.tagName.toLowerCase() == "input" || ae.hasAttribute("contenteditable")) return;
	e.preventDefault();
	e.stopImmediatePropagation();

	let player = document.querySelector(".html5-video-player");
	if (player.classList.contains("paused-mode")) cachedMode = "paused-mode";
	if (player.classList.contains("playing-mode")) cachedMode = "playing-mode";
	if (player.classList.contains("ended-mode")) cachedMode = "ended-mode";

	setTimeout(() => {
		let player = document.querySelector(".html5-video-player");
		if (player.classList.contains(cachedMode)) {
			document.querySelector("button.ytp-play-button").click();
			cachedMode = "";
		}
	}, 200);
});
