// ==UserScript==
// @name         Scam Site Blocker
// @namespace    blockWinScamSites
// @version      1.6
// @description  Block potential windows and mac scam sites
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

// do not run on these excluded websites
var exclusions = ["microsoft.com", "apple.com", "github.com", "greasyfork.org", "wikipedia.org", "reddit.com", "google.com", "live.com"];
var currentURL = location.hostname.split(".");
currentURL = currentURL[currentURL.length-2] + "." + currentURL[currentURL.length-1]
if (exclusions.indexOf(currentURL) > -1) return;

// Whether to block the page
var shouldBlockPage = false;

function main() {
	if (shouldBlockPage) return;

	// Products and keywords that are normally used in headers
	var products = ["microsoft", "windows", "apple", "mac"];
	var keywords = ["error", "security", "warning", "official", "support", "hotline", "virus", "infected", "infection", "blocked", "alert", "notification"];

	// Get the page's title
	var title = document.title.toLowerCase();
	var titleWords = title.split(" ");

	// Loop whether a product and keywords exist together
	// Only perform this check if the title length is under a certain number of words, to prevent news articles and other website false positives
	if (titleWords.length <= 5) {
		for (let i = 0; i < products.length; i++) {
			if (title.includes(products[i])) {
				for (let x = 0; x < keywords.length; x++) {
					if (title.includes(keywords[x])) {
						console.log("Blocked by title")
						shouldBlockPage = true;
					}
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
		var numberOfEncodedSigns = (script.match(/%/g) || []).length;
		if (numberOfEncodedSigns >= 50) redFlags++;
		if (script.Includes("document.documentElement.requestFullscreen") || script.Includes("document.documentElement.mozRequestFullScreen")) redFlags++;
	}

	// Block the page if there are too many red flags
	if (redFlags >= 3) {
		console.log("Blocked by red flags")
		shouldBlockPage = true;
	}

	// Otherwise, scan the page for commonly uses phrases
	var phrases = ["microsoft windows warning", "your computer was locked", "this computer is blocked", "your computer is blocked", "your computer has been blocked", "your computer has been infected", "your computer has alerted us", "call microsoft toll free", "windows has detected", "your system detected", "please call microsoft", "ransomware virus has infected your system", "trying to steal financial information", "information is being stolen", "removal process over the phone", "prevent your computer from being disabled", "contact our certified", "windows technician", "pornographic spyware", "malicious virus", "malicious malware", "mac os is infected", "if you leave your mac os will remain damaged", "if you leave this site your mac os will remain damaged", "phishing/spyware were found on your mac", "banking information are at risk", "if you close this page, your computer access will be disabled", "your computer access will be disabled to prevent further damage", "call us within the next 5 minutes to prevent your computer from being disabled", "enter windows registration key to unblock", "do not close this window and restart your computer", "your computer's registration key is unblocked", "has been blocked under instructions of a competent us government authority", "under this url is an offence in law", "contact microsoft engineer", "do not ignore this important warning", "suspicious activity detected on your ip address", "due to harmful virus installed in your computer", "contact microsoft helpline to reactivate your computer", "this window is sending virus over the internet", "is hacked or used from undefined location", "your system detected some unusual activity", "it might harm your computer data and track your financial activities", "there is a system file missing due to some harmfull virus", "debug malware error, system failure", "the following data may be compromised", "do not ignore this critical alert", "your computer access will be disabled to prevent further damage to our network", "our engineers can guide you through the phone removal process", "microsoft security tollfree", "error # dt00X02", "error # dt00X2", "contact_microsoft_support", "system_protect - protect_error", "to secure your data and windows system click here", "windows operating system alert", "windows & internet browser updates are needed to patch new security flaws and / or fix bugs in the system", "RDN/YahLover.worm!"];

	// Get page content
	var page = "";
	if (document.head) page += document.head.innerText.toLowerCase();
	if (document.body) page += document.body.innerText.toLowerCase();

	// Detect phrases
	for (let i = 0; i < phrases.length; i++) {
		if (page.indexOf(phrases[i]) > -1) {
			console.log("Blocked by page phrasing")
			shouldBlockPage = true;
		}
	}
}

// Block the page, by clearing it's content and replacing it
var finishedBlocking = false;
function blockPage() {
	if (shouldBlockPage && !finishedBlocking) {
		// Stop page from loading further
		window.stop();
		// Clear the header
		document.getElementsByTagName('head')[0].innerHTML = "<title>" + document.title + "</title>";
		// Rewrite problematic JS functions
		resetFullscreen();
		document.write = null;
		window.eval = null;
		window.alert = null;
		if (window.jQuery) $ = null;
		// Rewrite the body
		if (!document.body) {
			setTimeout(() => {
				document.body = document.createElement("body");
			}, 0);
		}
		document.body.innerHTML = "<center><h2>Suspicious Site Blocked by <a href='#' id='authorlink' style='color:#FFFFFF;'><u>Scam Site Blocker</u></a></h2><br /></center>";
		document.body.innerHTML += "<center>This website may be operated by scammers. Go back or close this page.<br /><br /></center>";
		document.body.innerHTML += "<center>If you think this is an error, confirm the website address before ignoring this warning.<br /><br /></center>";
		document.body.innerHTML += "<center><button id='ignorePage'>Ignore Warning</button></center>";
		document.body.style.fontSize = "18px";
		document.body.style.color = "#FFFFFF";
		document.body.style.backgroundColor = "#99000F";
		document.getElementById("ignorePage").style.padding = "6px";
		document.getElementById("authorlink").addEventListener("click", openAuthorPage);
		document.getElementById("ignorePage").addEventListener("click", ignorePage);
		// Finished
		finishedBlocking = true;
	}
}

function resetFullscreen() {
	setTimeout(() => {
		// Override fullscreen functions
		var elem = document.documentElement;
		if (elem.requestFullscreen) {
			elem.requestFullscreen = null;
		} else if (elem.mozRequestFullScreen) { /* Firefox */
			elem.mozRequestFullScreen = null;
		} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
			elem.webkitRequestFullscreen = null;
		} else if (elem.msRequestFullscreen) { /* IE/Edge */
			elem.msRequestFullscreen = null;
		}
		// Exit fullscreen
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) { /* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) { /* IE/Edge */
			document.msExitFullscreen();
		}
	}, 100);
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
