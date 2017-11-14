// ==UserScript==
// @name        Furigana remover on copy
// @namespace   furiganaremoverK
// @description	Remove furigana on copying of text
// @version     1.1.4
// @grant       none
// ==/UserScript==

// credit in part to https://stackoverflow.com/a/34112353 and https://stackoverflow.com/a/24464039
// hide furigana before sending and reenable after
document.addEventListener('copy', function (e) {
	if (!~[].indexOf.call(document.querySelectorAll("input, textarea"), document.activeElement)) {
		e.preventDefault();

		var fg = document.getElementsByClassName('fg');
		var rt = document.getElementsByTagName('rt');
		var furis;
		if (fg.length > 0) {
			furis = document.getElementsByClassName('fg');
		}
		else if (rt.length > 0) {
			furis = document.getElementsByTagName('rt');
		}
		else {
			e.clipboardData.setData('text', window.getSelection().toString());
		}

		if (furis.length > 0){
			for (var i = 0; i < furis.length; i++) {
				if (!furis[i].style.display){
					furis[i].style.visibility = 'hidden'; //For ClassNames
				}
				else {
					furis[i].style.display = 'none'; //For TagNames
				}
			}
			e.clipboardData.setData('text', window.getSelection().toString());
			for (var i = 0; i < furis.length; i++) {
				if (!furis[i].style.display){
					furis[i].style.visibility = 'visible'; //For ClassNames
				}
				else {
					furis[i].style.removeProperty('display'); //For TagNames
				}
			}
		}
	}
});