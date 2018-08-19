// ==UserScript==
// @name         Twitch - Redirect Live Videos to Popout Player Version
// @namespace    TwitchLiveVidPopoutPlayerRedirect
// @description  Redirect Twitch broadcasts to the minimal popout player version
// @version      1.0
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.twitch.tv/*
// @match        https://*.twitch.tv/*
// @run-at       document-end
// ==/UserScript==

setInterval(() => {
	var x = document.getElementsByClassName("channel-header"); // check whether the current page is a broadcast channel
	if (x.length <= 0) return;
	var videoPath = window.location.pathname;
	var popoutUrl = "https://player.twitch.tv/?channel=" + videoPath.substr(1);
	window.location.replace(popoutUrl);
}, 3000);
