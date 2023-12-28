// ==UserScript==
// @name        Quizlet - Reset Flashcard Progress on Refresh
// @namespace   QZLT_RRPOR_Kaiko
// @description	When refreshing the page in "Flashcards" mode, reset progress. | https://greasyfork.org/en/users/3656-kaiko
// @author      Kai Krause <kaikrause95@gmail.com>
// @match       http://quizlet.com/*/flashcards*
// @match       https://quizlet.com/*/flashcards*
// @version     1.2
// @grant       none
// ==/UserScript==

window.onbeforeunload = function resetCookie() {
	var name = "currentCardIndex";
	document.cookie = name+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};