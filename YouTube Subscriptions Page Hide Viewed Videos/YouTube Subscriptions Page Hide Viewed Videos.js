// ==UserScript==
// @name         YouTube Subscriptions Page: Hide Viewed Videos
// @namespace    hideViewedVideos_kk
// @description  Once a video is clicked, it will be hidden from the subscription page
// @version      1.1
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
function autoHideHidden () {
	setTimeout(function(){
		let dismissed = document.querySelectorAll('[is-dismissed]');
		for (let d of dismissed) {
			d.remove();
		}
	}, 100);
}
document.addEventListener('mouseup', autoHideHidden);

setInterval(() => {
	// Disable video preview in new YT subscription page for click target context
	document.querySelector("#video-preview")?.remove();
}, 100);

// Hide videos when clicked
function autoHideClicked (e) {
	if (rightClick(e)) return;
	let target = getTarget(e);

	// Disable video channel clicks from removing the video
	if (target.href && (target.href.includes('/user/') || target.href.includes('/channel/'))) return;
	// Disable video menu clicks from removing the video, and ignore the thumbnail 'play' animation
	if (target.tagName === "BUTTON" || target.tagName === "YT-ICON" && target.id !== "play") return;

	while (target) {
		// ignore menu on-click
		if (target?.classList?.contains("yt-icon-button")) {
			return;
		}

		if (target?.tagName === "YTD-GRID-VIDEO-RENDERER" || target.id === "dismissible" && target?.classList?.contains("ytd-rich-grid-media")) {
			let hideMenuButton = target.getElementsByTagName('button')[0];
			hideMenuButton.click();

			setTimeout(function() {
				// Hide the video via the youtube menus, because 1) lazy, 2) easier to update in future
				let hideMenu = document.querySelector(".ytd-menu-popup-renderer");
				let hideButton = hideMenu.querySelectorAll("yt-formatted-string");
				hideButton[hideButton.length-1].click();
				autoHideHidden();
			}, 4);

			break;
		}
		else {
			target = target.parentNode;
		}
	}
}
document.addEventListener('mouseup', autoHideClicked);
