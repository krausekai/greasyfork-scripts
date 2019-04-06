// ==UserScript==
// @name         YouTube Subscriptions Page: Hide Hidden Videos
// @namespace    hideHiddenVideos_kk
// @description  Once a video is hidden, automatically hide the video as well
// @version      0.2
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.youtube.com/*
// @match        https://*.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Youtube's inline loading method may confuse the browser
if (!location.href.includes('youtube.com/feed/subscriptions')) return;

function autoHideHidden () {
	var renderers = document.getElementsByTagName('ytd-grid-video-renderer');

	for (var i = 0; i < renderers.length; ++i) {
		var dismissedItem = renderers[i].getAttribute('is-dismissed');
		if (dismissedItem === "") {
			renderers[i].remove();
			break;
		}
	}
}
document.addEventListener('click', autoHideHidden);
