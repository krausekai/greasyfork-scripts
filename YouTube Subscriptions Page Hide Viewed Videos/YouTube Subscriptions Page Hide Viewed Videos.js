// ==UserScript==
// @name         YouTube Subscriptions Page: Hide Viewed Videos
// @namespace    hideViewedVideos_kk
// @description  Once a video is clicked, it will be hidden from the subscription page
// @version      0.7
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.youtube.com/*
// @match        https://*.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Youtube's inline loading method may confuse the browser
if (!location.href.includes('youtube.com/feed/subscriptions')) return;

// Helper functions
function getTarget(e) {
	e = e || window.event;
	return e.target || e.srcElement;
}
function rightClick(e) {
	e = e || window.event;
	if ("which" in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		return e.which === 3;
	} else if ("button" in e) { // IE, Opera
		return e.button === 2;
	}
}

// Hide 'video is hidden' message from hidden videos
function autoHideHidden (e) {
	if (rightClick(e)) return;

	setTimeout(function(){
		var renderers = document.getElementsByTagName('ytd-grid-video-renderer');
		for (var i = 0; i < renderers.length; ++i) {
			var dismissedItem = renderers[i].getAttribute('is-dismissed');
			if (dismissedItem === "") {
				renderers[i].remove();
				break;
			}
		}
	}, 4);
}
document.addEventListener('mouseup', autoHideHidden);

// Hide videos when clicked
function autoHideClicked (e) {
	if (rightClick(e)) return;
	var target = getTarget(e);

	// Disable video channel clicks from removing the video
	if (target.href && (target.href.includes('/user/') || target.href.includes('/channel/'))) return;
	// Disable video menu clicks from removing the video, and ignore the thumbnail 'play' animation
    if (target.tagName === "BUTTON" || target.tagName === "YT-ICON" && target.id !== "play") return;

	while (target) {
		if (target.tagName === "YTD-GRID-VIDEO-RENDERER") {

			var hideMenuButton = target.getElementsByTagName('button')[0];
			hideMenuButton.click();

			setTimeout(function() {
				// Hide the video via the youtube menus, because 1) lazy, 2) easier to update in future
				var hideMenu = document.getElementsByTagName('ytd-popup-container')[0];
				var hideButton = hideMenu.getElementsByTagName('yt-formatted-string');
				hideButton[hideButton.length-1].click();

				/*
				for (var i = 0; i < hideButton.length; ++i) {
					if (hideButton[i].innerHTML === "Hide") {
						hideButton[i].click();
						break;
					}
				}
				*/

				autoHideHidden(e);
			}, 4);

			break;
		} else {
			target = target.parentNode;
		}
	}
}
document.addEventListener('mouseup', autoHideClicked);
