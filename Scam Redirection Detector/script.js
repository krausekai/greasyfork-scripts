// ==UserScript==
// @name         Scam Site Blocker
// @namespace    blockWinScamSites
// @version      1.3
// @description  Block potential windows and mac scam sites
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

// do not run on these excluded websites
var exclusions = ["microsoft.com", "apple.com", "github.com", "greasyfork.org", "wikipedia.org", "reddit.com"];
if (exclusions.indexOf(location.hostname) > -1) return;

// Whether to block the page
var shouldBlockPage = false;

function main() {
	// Products and keywords that are normally used in headers
	var products = ["microsoft", "windows", "apple", "mac"];
	var keywords = ["error", "security", "warning", "official", "support", "hotline", "virus", "infected", "infection", "blocked", "alert"];

	// Get the page's title
	var title = document.title.toLowerCase();

	// Loop whether a product and keywords exist together
	for (let i = 0; i < products.length; i++) {
		if (title.includes(products[i])) {
			for (let x = 0; x < keywords.length; x++) {
				if (title.includes(keywords[x])) {
					shouldBlockPage = true;
				}
			}
		}
	}

	// If the page hasn't been blocked, use flags until a decision is made
	var redFlags = 0;

	// If the page is related to a product, flag it
	for (let i = 0; i < products.length; i++) {
		if (title.includes(products[i])) {
			redFlags++;
		}
	}

	// Get all inline script tags, and check whether they contain obfuscated JS techniques
	var scripts = document.getElementsByTagName(script);
	for (let i = 0; i < scripts.length; i++) {
		var script = scripts[i].innerText;
		if (script.Includes("eval")) redFlags++;
		if (script.Includes("unescape")) redFlags++;
		if (script.Includes("fromCharCode") || script.Includes("charCodeAt")) redFlags++;
	}

	// Block the page if there are too many red flags
	if (redFlags >= 2) {
		shouldBlockPage = true;
	}

	// Otherwise, scan the page for commonly uses phrases
	var phrases = ["this computer is blocked", "your computer has been blocked", "your computer has alerted us", "call microsoft toll free", "windows has detected", "your system detected", "please call microsoft", "ransomware virus has infected your system", "trying to steal financial information", "information is being stolen", "removal process over the phone", "prevent your computer from being disabled", "contact our certified", "windows technician", "pornographic spyware", "malicious virus", "malicious malware", "mac os is infected", "if you leave your mac os will remain damaged", "banking information are at risk", "if you close this page, your computer access will be disabled", "your computer access will be disabled to prevent further damage", "call us within the next 5 minutes to prevent your computer from being disabled", "enter windows registration key to unblock", "do not close this window and restart your computer", "your computer's registration key is unblocked", "has been blocked under instructions of a competent us government authority", "under this url is an offence in law", "contact microsoft engineer", "do not ignore this important warning", "suspicious activity detected on your IP address", "due to harmful virus installed in your computer", "contact microsoft helpline to reactivate your computer"];

	// Get page content
	var page = document.body.innerText.toLowerCase();

	// Detect phrases
	for (let i = 0; i < phrases.length; i++) {
		if (page.indexOf(phrases[i]) > -1) {
			shouldBlockPage = true;
		}
	}
}

// Block the page, by clearing it's content and replacing it
var finishedBlocking = false;
function blockPage() {
	if (shouldBlockPage && !finishedBlocking) {
		window.stop();
		document.getElementsByTagName('head')[0].innerHTML = "<title>" + document.title + "</title>";
		document.body.innerHTML = "<center><h2>Suspicious Site Blocked by <a href='#' id='authorlink' style='color:#FFFFFF;'><u>Scam Site Blocker</u></a></h2><br /></center>";
		document.body.innerHTML += "<center>This website may be operated by scammers. Go back or close this page.<br /><br /></center>";
		document.body.innerHTML += "<center>If you think this is an error, confirm the website address before ignoring this warning.<br /><br /></center>";
		document.body.innerHTML += "<center><button id='ignorePage'>Ignore Warning</button></center>";
		document.body.style.fontSize = "18px";
		document.body.style.color = "#FFFFFF";
		document.body.style.backgroundColor = "#440006";
		document.getElementById("ignorePage").style.padding = "6px";
		document.getElementById("authorlink").addEventListener("click", openAuthorPage);
		document.getElementById("ignorePage").addEventListener("click", ignorePage);
		finishedBlocking = true;
	}
}

// open greasyfork page
function openAuthorPage() {
	window.open("https://greasyfork.org/en/scripts/373815-scam-site-blocker", "_blank");
}

// ignore pages by domain name, handled via GM storage
function ignorePage() {
	if (GM_setValue) {
		GM_setValue(location.hostname, "ignored");
		location.reload();
	}
}

// check if page is ignored
var isPageIgnored = GM_getValue(location.hostname);

// run code blocks
var runTime = Date.now();
if (isPageIgnored !== "ignored") {
	var interval = setInterval(function() {
		main();
		blockPage();
		// Remove interval if page has been blocked, or, the script has run for longer than 3 seconds
		if(shouldBlockPage || (Date.now() - runTime) / 1000 >= 3) {
			return clearInterval(interval);
		}
	}, 4);
}
