// ==UserScript==
// @name         Tumblr Autoplay Videos Disabler
// @namespace    disableTumblrAutoplay
// @version      1.0
// @description  Disable autoplaying videos on Tumblr
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.tumblr.com/*
// @match        https://*.tumblr.com/*
// @run-at       document-start
// ==/UserScript==

// A test script that is currently broken on tumblr dashboard...
// But, functions on blogs

setInterval(() => {
  var videos = document.body.getElementsByTagName("video");
  for (var i = 0; i < videos.length; i++) {
		// Cache the parent node
		var figure = videos[i].parentNode;

		// Is the figure loaded?
		if (location.href.includes("tumblr.com/dashboard")) {
			if (!figure.hasAttribute("data-crt-video")) {
				return;
			}
			figure = figure.parentNode;
		}
		else if (figure.tagName.toLowerCase() !== "figure") {
			return;
		}
		// Has the video been overwriten once before?
		if (videos[i].hasAttribute("rewritten")) {
			return;
		}

		// Give the video an ID to not rewrite it again
		videos[i].setAttribute("rewritten", "rewritten");
		// Get video preview image and data
		var previewImg = videos[i].parentNode.getAttribute("data-npf");
		if (previewImg) {
			previewImg = JSON.parse(previewImg);
			previewImg = previewImg.poster[0].url;
		}
		else {
			previewImg = videos[i].parentNode.getAttribute("poster");
		}

		var videoData = videos[i].parentNode.outerHTML;
		// Create a button to play the button, which is created from the preview image
		var btn = document.createElement("IMG");
		btn.setAttribute("src", previewImg);
		btn.setAttribute("autoplay_videodata", videoData);

		// Due to timing issues of code execution, removing the autoplay attribute from the video is not always effective
		// Therefore, wipe the current video from autoplaying
		videos[i].outerHTML = "";

		// Re-write the video player with the new play button, inserted before post text
		figure.prepend(btn);
	}
}, 1000);

document.addEventListener("click", (e) => {
	if (!e.target.hasAttribute("autoplay_videodata")) return;
	e.target.parentNode.outerHTML = e.target.getAttribute("autoplay_videodata");
})