// ==UserScript==
// @name         Active Tab Arrow Display
// @namespace    ActiveTabArrowDisplay
// @description  Display an arrow on the title of the currently active tab
// @version      1.0
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @run-at       document-end
// ==/UserScript==

var title = document.title;
var modifier = "➜ ";

function flashTitle() {
	setTimeout(() => {
		if (document.hasFocus() || !document.hidden) {
			document.title = modifier + title;
		} else if (!document.hasFocus() && document.hidden) {
			document.title = title;
		}
	}, 500);
}

flashTitle(title);

window.addEventListener("focus", flashTitle, true);
window.addEventListener("blur", flashTitle, true);