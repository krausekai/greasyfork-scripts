// ==UserScript==
// @name         Tumblr Classic Blue
// @namespace    tumblrClassicTheme_kk
// @description  Change Tumblr's blue to classic blue
// @version      1.3
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.tumblr.com/*
// @match        https://*.tumblr.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

var backgroundBlues = ["rgb(0, 25, 53)", "rgba(0, 25, 53, 0)"];
var classicBlueBackgroundCSS = ".classicBlueBackground_KK{background-color: #36465D !important;}";

var cachedElements = [];
var cssCheck = '';
function classicBackgroundCSS() {
	if (cssCheck.length < 1) {
		var classicBlueBackground_KK = document.createElement("style");
		classicBlueBackground_KK.innerText = classicBlueBackgroundCSS;
		document.head.appendChild(classicBlueBackground_KK);
		cssCheck = document.getElementsByClassName("classicBlueBackground_KK");
	}
	applyCSS("classicBlueBackground_KK");
}

function applyCSS (className) {
	var allElements = document.querySelectorAll('*');
	for (var i = 0; i < allElements.length; i++) {
		var element = allElements[i];
		if (cachedElements.indexOf(element) > -1) continue;
		cachedElements.push(element);
		setCSS(element, className);
	}
}

function setCSS(element, className) {
	setTimeout(function(){
		var elementComputed = window.getComputedStyle(element, null);
		var background = elementComputed.getPropertyValue("background");
		var backgroundColor = elementComputed.getPropertyValue("background-color");
		for (var i = 0; i < backgroundBlues.length; i++) {
			if (background && background.includes(backgroundBlues[i]) || backgroundColor && backgroundColor.includes(backgroundBlues[i])) {
				element.classList.add(className);
			}
		}
	}, Math.random(4,12));
}

// Page Load
classicBackgroundCSS();

// constantly check for css every second while page is loading
var x = setInterval(() => {
	classicBackgroundCSS();
}, 10);

// delete the above interval after a number of seconds
setTimeout(() => {
	clearInterval(x);
}, 2500);

// Peformant Dynamic function wrapper
var oldScrollPos = 0;
function dynamicScroll (f) {
	window.addEventListener("scroll", (function(){
		var scrollDifference = Math.abs(oldScrollPos-window.scrollY);
		if (scrollDifference > 500) {
			window.requestAnimationFrame(f);
			oldScrollPos = window.scrollY;
		}
	}), false);
}
dynamicScroll(classicBackgroundCSS);
