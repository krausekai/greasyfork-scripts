// ==UserScript==
// @name         Twitch - Redirect Videos (VoDs) to Popout Player Version
// @namespace    TwitchVoDPopoutPlayerRedirect
// @description  Save CPU usage by redirecting Twitch Videos (VoDs) to popout player version
// @version      1.1
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/*
// @match        https://*.twitch.tv/*
// @run-at       document-start
// ==/UserScript==

function redirect() {
	if (!window.location.href.includes("twitch.tv/videos/")) return
	setTimeout(() => {
		var videoPath = window.location.href;
		var video = videoPath.match(/(?:[videos/])(\d+)(?:\?|)/g);
		video = video[0].replace("?", "");
		var popoutUrl = "https://player.twitch.tv/?video=v" + video;
		var timeStamp = videoPath.match(/(?:t=)(\d.+(?:\d[A-Za-z]{1}))/g);
		if (timeStamp) {
			timeStamp = timeStamp[0].replace("t=", "");
			popoutUrl += "&time=" + timeStamp;
		}
		window.location.replace(popoutUrl);
	}, 1200);
}
redirect();

// dynamic pages
window.addEventListener("click", redirect, false);