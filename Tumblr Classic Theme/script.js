// ==UserScript==
// @name         Tumblr Classic Blue
// @namespace    tumblrClassicTheme_kk
// @description  Change Tumblr's blue to classic blue
// @version      1.8
// @author       Kai Krause <kaikrause95@gmail.com>
// @match        http://*.tumblr.com/*
// @match        https://*.tumblr.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// REPLACE THE BASE COLORS WITH CLASSIC COLORS

var newBaseCSS = ".tab_notice .tab_notice_value{color:#36465D!important}.tab-notice--outlined{border-color:#36465D!important}.identity{background-color:#36465D!important}.l-container.l-container--two-column-dashboard .l-content{background-color:#36465D!important}.l-container.l-container--two-column-dashboard .right_column{background-color:#36465D!important}.l-container.l-container--two-column-dashboard .left_column{background-color:#36465D!important}.identity .right_column:after{background:linear-gradient(180deg,#36465D,rgba(54,70,93,0))!important}.identity .controls_section.user_list li .follow_list_item_blog:before{background-image:linear-gradient(90deg,rgba(54,70,93,0),#36465D)!important;border-right:5px solid #36465D!important}.post_avatar{background-color:#36465D!important}.post_avatar .post_avatar_link{background-color:#36465D!important}.post_full .post_permalink{border-top-color:#36465D!important;border-right-color:#36465D!important}.plus-follow-button{color:#36465D!important}.tab-bar-container .tab_notice{color:#36465D!important}.l-header-container--refresh{background-color:#36465D!important}.radar .radar_footer .radar_avatar::before{background-image:linear-gradient(to right,rgba(54,70,93,0),#36465D)!important}.ui_dialog_lock{background:rgba(54,70,93,.95)!important}.post-forms-glass{background-color:rgba(54,70,93,.95)!important}.l-container.l-container--two-column .l-content {background-color:#36465D!important}.l-container.l-container--two-column .right_column {background-color:#36465D!important}.ui_peepr_glass{background-color:#36465D!important}.rapid-recs-container .rapid-recs {background-image: none !important}.search_results_container .tumblelog_mask_item {background-color:#36465D !important}.l-container.l-container--flex .l-content {background-color:#36465D!important}";

var newBaseCSS_kk = document.createElement("style");
newBaseCSS_kk.innerText = newBaseCSS;
if (document.head) document.head.appendChild(newBaseCSS_kk);

let intA = setInterval(() => {
	if (document.head) {
		document.head.appendChild(newBaseCSS_kk);
		clearInterval(intA);
	}
}, 1);

// DYNAMICALLY REPLACE BASE BLUE COLOR WITH CLASSIC BLUE, FOR IF ABOVE FAILS

var backgroundBlues = ["rgb(0, 25, 53)", "rgba(0, 25, 53, 0)", "001935"];
var backgroundBluesTransparent = ["rgba(0, 25, 53, 0.95)"];
var classicBlueBackgroundCSS = ".classicBlueBackground_KK{background-color: rgb(54, 70, 93) !important;} .classicBlueBackgroundTransparent_KK{background-color: rgba(54, 70, 93, 0.99) !important;}";

var classicBlueBackground_KK = document.createElement("style");
classicBlueBackground_KK.innerText = classicBlueBackgroundCSS;
if (document.head) document.head.appendChild(classicBlueBackground_KK);

let intB = setInterval(() => {
	if (document.head) {
		document.head.appendChild(classicBlueBackground_KK);
		clearInterval(intB);
	}
}, 1);

var cachedElements = [];
function applyCSS () {
	var allElements = document.querySelectorAll('*');
	for (var i = 0; i < allElements.length; i++) {
		var element = allElements[i];
		if (cachedElements.indexOf(element) > -1) continue;
		cachedElements.push(element);
		setCSS(element);
	}
}

function setCSS(element) {
	setTimeout(function(){
		var elementComputed = window.getComputedStyle(element, null);
		var background = elementComputed.getPropertyValue("background");
		var backgroundColor = elementComputed.getPropertyValue("background-color");
		for (var i = 0; i < backgroundBlues.length; i++) {
			if (background && background.includes(backgroundBlues[i]) || backgroundColor && backgroundColor.includes(backgroundBlues[i])) {
				element.classList.add("classicBlueBackground_KK");
			}
		}
		for (var i = 0; i < backgroundBluesTransparent.length; i++) {
			if (background && background.includes(backgroundBluesTransparent[i]) || backgroundColor && backgroundColor.includes(backgroundBluesTransparent[i])) {
				element.classList.add("classicBlueBackgroundTransparent_KK");
			}
		}
	}, Math.random(4,12));
}

// Page Load
applyCSS();

// constantly check for css changes
var x = setInterval(() => {
	applyCSS();
}, 10);

// Peformant Dynamic function wrapper
var oldScrollPos = 0;
window.addEventListener("scroll", (function(){
	var scrollDifference = Math.abs(oldScrollPos-window.scrollY);
	if (scrollDifference > 500) {
		applyCSS();
		oldScrollPos = window.scrollY;
	}
}), false);
