// ==UserScript==
// @name         Tumblr Classic Blue
// @namespace    tumblrClassicTheme_kk
// @description  Change Tumblr's blue to classic blue
// @version      1.6
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
document.head.appendChild(newBaseCSS_kk);

// DYNAMICALLY REPLACE BASE BLUE COLOR WITH CLASSIC BLUE, FOR IF ABOVE FAILS

var backgroundBlues = ["rgb(0, 25, 53)", "rgba(0, 25, 53, 0)", "001935"];
var classicBlueBackgroundCSS = ".classicBlueBackground_KK{background-color: #36465D !important;}";

var classicBlueBackground_KK = document.createElement("style");
classicBlueBackground_KK.innerText = classicBlueBackgroundCSS;
document.head.appendChild(classicBlueBackground_KK);

var cachedElements = [];
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
applyCSS("classicBlueBackground_KK");

// constantly check for css every second while page is loading
var x = setInterval(() => {
	applyCSS("classicBlueBackground_KK");
}, 10);

// delete the above interval after a number of seconds
setTimeout(() => {
	clearInterval(x);
}, 1000);

// Peformant Dynamic function wrapper
var oldScrollPos = 0;
window.addEventListener("scroll", (function(){
	var scrollDifference = Math.abs(oldScrollPos-window.scrollY);
	if (scrollDifference > 500) {
		applyCSS("classicBlueBackground_KK");
		oldScrollPos = window.scrollY;
	}
}), false);
