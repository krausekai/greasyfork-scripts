// ==UserScript==
// @name         Tumblr Video HD Redirect and Dashboard Download Button
// @namespace    TumblrVideoReszr
// @description  Automatically redirect Tumblr video links to raw HD versions, and display a download button below videos on the dashboard
// @version      1.0
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.tumblr.com/*
// @match        https://*.tumblr.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Typical Video URL Patterns:
// https://vt.media.tumblr.com/tumblr_ID_NUM.mp4
// https://vtt.tumblr.com/tumblr_ID_NUM.mp4
// https://vt.tumblr.com/tumblr_ID_NUM.mp4

var loc = location.toString();

function redirectToHD() {
	// Check that the URL is a ~.mp4
	if (!loc.endsWith('.mp4')) return;

	var lowQuality = /[$_]\d*.mp4$/;
	// Do not redirect if already HD
	if (!loc.match(lowQuality)) return;
	// Change to HD
	loc = loc.replace(lowQuality, '.mp4');

	// If the URL is HTTP, change it to HTTPS
	if (!loc.startsWith('https://')) {
		loc = loc.replace(/^http/, 'https');
	}

	// Redirect to the HD video
	location.replace(loc);
}
redirectToHD();

function createDownloadButtons() {
	// Get all tumblr posts on dashboard page. Cannot access blog videos because they are cross-origin iframes.
	if (loc.includes('tumblr.com/dashboard') || loc.includes('tumblr.com/like')) { } else { return; }
	var posts = document.getElementsByClassName('post_media');

	// Create the button style
	var downloadButtonStyle = document.createElement("style");
	downloadButtonStyle.innerText = ".videoDownloadButtonStyle_kk{display:block; width:100%; height:100%; padding:4px; border:2px solid #979EA8; background-color:#2F3D51; color: #979EA8; font-weight: 600; text-align: center;} .videoDownloadButtonStyle_kk:hover{color:#F5F5F5;}";
	document.head.appendChild(downloadButtonStyle);

	for (var i = 0; i < posts.length; ++i) {
		var videos = posts[i].getElementsByTagName('video');
		if (videos[0]) {
			for (var a = 0; a < videos.length; ++a) {
				// if the button already exists, ignore this post
				var btnCheck = posts[i].getElementsByClassName('videoDownloadButtonStyle_kk');
				if (btnCheck[0]) break;

				// Create the button
				var downloadButton = document.createElement('a');
				downloadButton.innerText = 'Download This Video (HD)';

				// Generate the video URL
				var videoURL;
				// Check whether the video is a livePhoto
				var livePhoto = videos[a].getAttribute("class");
				if (livePhoto == "live-photo-video") {
					videoURL = videos[a].src;
				}
				// Otherwise, use the video preview image url
				else if (videos[a].poster) {
					videoURL = videos[a].poster;
					videoURL = videoURL.replace(/\d+(?=\.media)/, 'vt');
					videoURL = videoURL.replace(/[^_]*$/, '');
					videoURL = videoURL.replace(/_$/, '.mp4');
				} else {
					continue;
				}

				// Set and style the download button
				downloadButton.setAttribute('class', 'videoDownloadButtonStyle_kk');
				downloadButton.setAttribute('href', videoURL);
				posts[i].appendChild(downloadButton);
			}
		}
	}
}
// For endless scrolling users
window.addEventListener("scroll", createDownloadButtons, false);

// For initial page load
window.addEventListener("DOMContentLoaded", function load() {
	window.removeEventListener("DOMContentLoaded", load, false);
	createDownloadButtons();
}, false);
