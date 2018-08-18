// ==UserScript==
// @name         Twitch - Redirect Videos (VoDs) to Popout Player Version
// @namespace    TwitchVoDPopoutPlayerRedirect
// @description  Save CPU usage by redirecting Twitch Videos (VoDs) to popout player version
// @version      1.0
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/*
// @match        https://*.twitch.tv/*
// @run-at       document-start
// ==/UserScript==

function redirect() {
	if (!window.location.href.includes("twitch.tv/videos/")) return
	setTimeout(() => {
		var videoPath = window.location.pathname;
		var video = videoPath.match(/(?:[videos/])(\d+)(?:\?|)/g);
		var popoutUrl = "https://player.twitch.tv/?video=v" + video[0];
		window.location.replace(popoutUrl);
	}, 1200);
}
redirect();

// dynamic pages
window.addEventListener("click", redirect, false);