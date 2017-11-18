// ==UserScript==
// @name         Clean Font Weights
// @namespace    cleanFonts_kk
// @description  Make website font-weights standard (400) if below 400
// @version      0.1
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @run-at       document-end
// @grant        none
// ==/UserScript==

// create the font
var fontOverride_kk = document.createElement("style");
fontOverride_kk.innerText = ".fontOverride_kk{font-weight: 400 !important;}";
document.head.appendChild(fontOverride_kk);

// Get classes and tags without classes
var allElements = document.querySelectorAll('*');
for (var i = 0; i < allElements.length; i++) {
	var css = window.getComputedStyle(allElements[i], null);
	var fontWeight = css.getPropertyValue("font-weight");
	if (fontWeight && fontWeight < 400) {
		allElements[i].classList.add("fontOverride_kk");
	}
}