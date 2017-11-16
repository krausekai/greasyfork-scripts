// ==UserScript==
// @name         Tumblr HD Video Download Buttons
// @namespace    TumblrVideoReszr
// @description  Automatically redirect Tumblr video links to raw HD versions, and display a download button below videos
// @version      1.1
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.tumblr.com/*
// @match        https://*.tumblr.com/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      tumblr.com
// ==/UserScript==

// Typical Video URL Patterns:
// https://vt.media.tumblr.com/tumblr_ID_NUM.mp4
// https://vtt.tumblr.com/tumblr_ID_NUM.mp4
// https://vt.tumblr.com/tumblr_ID_NUM.mp4

var loc = location.toString();

// ----------------------------------------
// DIRECT MP4 URLS
// ----------------------------------------

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

// ----------------------------------------
// DOWNLOAD BUTTON STYLE
// ----------------------------------------

// Create the button style
var downloadButtonStyle = document.createElement("style");
downloadButtonStyle.innerText = ".videoDownloadButtonStyle_kk{display:block; width:100%; height:100%; padding:4px; border:2px solid #979EA8; background-color:#2F3D51; color: #979EA8 !important; font-weight: 600 !important; text-align: center; text-decoration: none !important} .videoDownloadButtonStyle_kk:hover{color:#F5F5F5 !important;}";
document.head.appendChild(downloadButtonStyle);

// ----------------------------------------
// DASHBOARD BUTTONS
// ----------------------------------------

function dashboardDownloadButtons() {
	var posts = document.getElementsByClassName('post_media');

	for (var i = 0; i < posts.length; ++i) {
		var videos = posts[i].getElementsByTagName('video');
		if (videos[0]) {
			for (var a = 0; a < videos.length; ++a) {
				// if the button already exists, ignore this post
				var btnCheck = posts[i].getElementsByClassName('videoDownloadButtonStyle_kk');
				if (btnCheck[0]) continue;

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
if (loc.includes('tumblr.com/dashboard') || loc.includes('tumblr.com/like')) {
	window.addEventListener("DOMContentLoaded", function load() {
		window.removeEventListener("DOMContentLoaded", load, false);
		// For initial page load
		dashboardDownloadButtons();
		// For endless scrolling users
		window.addEventListener("scroll", dashboardDownloadButtons, false);
	}, false);
}

// ----------------------------------------
// BLOG BUTTONS
// ----------------------------------------

function req (postNum, video) {
	GM_xmlhttpRequest({
		url: video,
		method: 'GET',
		onload: function(response) {
			if (response.status == '200' && response.responseText) {
				var text = response.responseText;
				var a = text.match("\/tumblr_*.+_smart1.");
				var videoUrl = "https://vt.tumblr.com" + a[0].toString() + "mp4";
				videoUrl = videoUrl.replace("_smart1", "");
				embedBlogDownloadButtons(postNum, videoUrl);
			}
		}
	});
}
var postCache = [];
function blogDownloadButtons() {
	var posts = document.getElementsByClassName('tumblr_video_container');
	for (var i = 0; i < posts.length; i++) {
		// if the button already exists, ignore this post
		var btnCheck = posts[i].getElementsByClassName('videoDownloadButtonStyle_kk');
		if (postCache.indexOf(posts[i].id) > -1 || btnCheck[0]) continue;
		// Cache the current post ID
		postCache.push(posts[i].id);

		// Get the iframe of this post, which has the video URL
		var frames = posts[i].getElementsByTagName("iframe");
		var frame = frames[0];
		if (frame.src.includes("/video/")) {
			// Get the video url via a crossDomain request from the iframe
			req(i, frame.src);
		}
	}
}
function embedBlogDownloadButtons (postNum, videoURL) {
	var posts = document.getElementsByClassName('tumblr_video_container');
	var post = posts[postNum];
	// Create the button
	var downloadButton = document.createElement('a');
	downloadButton.innerText = 'Download This Video (HD)';
	// Set and style the download button
	downloadButton.setAttribute('class', 'videoDownloadButtonStyle_kk');
	downloadButton.setAttribute('href', videoURL);
	post.appendChild(downloadButton);
}
if (location.hostname.includes('tumblr.com') && location.hostname != 'tumblr.com') {
	window.addEventListener("DOMContentLoaded", function load() {
		window.removeEventListener("DOMContentLoaded", load, false);
		// For initial page load
		blogDownloadButtons();
		// For endless scrolling users
		window.addEventListener("scroll", blogDownloadButtons, false);
	}, false);
}