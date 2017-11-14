// ==UserScript==
// @name        Quizlet - Hotkeys to Search Flash Cards by Accuracy
// @namespace   QZLT_flashcardSelectKBMode
// @description Press the 1-2-3-4 number keys to navigate large decks easily
// @author      Kai Krause <kaikrause95@gmail.com>
// @match       http://quizlet.com/*flash-cards/*
// @match       https://quizlet.com/*flash-cards/*
// @version     1.4
// @grant       none
// ==/UserScript==

window.onload = function(){
	var titles = document.getElementsByClassName("SetPageTermChunk-title");

	for (var i = 0; i < titles.length; i++){
		titles[i].innerHTML += "<a style='visibility:hidden' name='" +  titles[i].textContent + "'></a>";
	}

	window.addEventListener("keydown", titleSelect, true);

	function titleSelect(charE) {
		var el = document.activeElement;
		if (el.tagName.toLowerCase() != 'textarea') {
			if (charE.keyCode == "49") {
				window.location.hash = "Often Missed";
			}else if (charE.keyCode == "50") {
				window.location.hash = "Sometimes Missed";
			}else if (charE.keyCode == "51") {
				window.location.hash = "Never Missed";
			}else if (charE.keyCode == "52") {
				window.location.hash = "No Answers Yet";
			}
		}
	}
}