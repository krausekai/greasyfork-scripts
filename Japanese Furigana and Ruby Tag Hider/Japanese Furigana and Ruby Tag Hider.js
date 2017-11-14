// ==UserScript==
// @name        Japanese Furigana and Ruby Tag Hider
// @namespace   autoHideRubyKK
// @author      Kai Krause <kaikrause95@gmail.com>
// @description Automatically hide ruby tags (used for Japanese Furigana) on text (small text above sentences), and show them with the mouse.
// @include	    *
// @version     1.1
// @grant       none
// ==/UserScript==

window.addEventListener('load', function() {
	var newcss = "ruby rt{ visibility:hidden; } ruby:hover rt{ visibility:visible; }";
	if ("\v" == "v") {
		document.createStyleSheet().cssText = newcss;
	} else {
		var tag = document.createElement("style");
		tag.type = "text/css";
		document.getElementsByTagName("head")[0].appendChild(tag);
		tag[(typeof document.body.style.WebkitAppearance == "string") ? "innerText" : "innerHTML"] = newcss;
	}
}, false);