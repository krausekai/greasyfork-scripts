// ==UserScript==
// @name         Reddit Hide All Posts & Reload Hotkey
// @namespace    redditposthideandreload_kk
// @version      1.3
// @description  Hide all posts & reload page on Ctrl+Shift+R; cancel with Escape
// @match        https://*.reddit.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

var oldhidebtns;
var newhidebtns;

function getbtns() {
	oldhidebtns = document.getElementsByTagName("a");
	newhidebtns = document.getElementsByClassName("icon-hide");
}

var wait = ms => new Promise(resolve => setTimeout(resolve, ms));
var waitTime = 350;
var canReload = true;

async function doHide() {
	getbtns();

	try {
		for (var i = 0; i < oldhidebtns.length; i++) {
            if (!canReload) return;

			if (oldhidebtns[i].innerText.toLowerCase() === "hide") {
				oldhidebtns[i].click();
                await wait(waitTime);
			}
		}

		var didNewBtnRun = false;

		for (var i = 0; i < newhidebtns.length; i++) {
            if (!canReload) return;

			newhidebtns[i].click();
			didNewBtnRun = true;
			await wait(waitTime);
		}

		if (didNewBtnRun) return doHide();

		await wait(waitTime + 1000);

        if (!canReload) return;

		location.reload();
	}
	catch (e) {
		console.warn(e);
		doHide();
	}
}

document.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.shiftKey && e.keyCode == 82) {
		e.preventDefault();
        canReload = true;
		doHide();
	}
	if (e.key.toLowerCase() === "escape" || e.code.toLowerCase() === "escape") {
		e.preventDefault();
		canReload = false;
	}
}, false);

