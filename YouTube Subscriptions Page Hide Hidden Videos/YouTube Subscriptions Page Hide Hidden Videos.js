// ==UserScript==
// @name         YouTube Subscriptions Page: Hide Hidden Videos
// @namespace    hideHiddenVideos_kk
// @description  Once a video is hidden, automatically hide the video as well
// @version      0.1
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://www.youtube.com/feed/subscriptions*
// @match        https://www.youtube.com/feed/subscriptions*
// @grant        none
// @run-at       document-end
// ==/UserScript==

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
