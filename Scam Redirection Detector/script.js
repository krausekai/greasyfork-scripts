// ==UserScript==
// @name         Scam Site Blocker
// @namespace    blockWinScamSites
// @version      2.4
// @description  Block potential windows and mac scam sites
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

// do not run on these excluded websites
var exclusions = ["microsoft.com", "apple.com", "github.com", "greasyfork.org", "wikipedia.org", "reddit.com", "google.com", "live.com", "mozilla.org", "youtube.com", "facebook.com", "twitter.com", "mcafee.com", "mcafeesecure.com", "mcafeemobilesecurity.com"];
var currentURL = location.hostname.split(".");
currentURL = currentURL[currentURL.length-2] + "." + currentURL[currentURL.length-1]
if (exclusions.indexOf(currentURL) > -1) return;

// Time since the page has started to load
var timer = Date.now();
// Helper function to understand elapsed time
function elapsedTime(timer, num) {
	var currentTime = Date.now();
	var difference = (currentTime - timer) / 1000;
	if (difference > num) {
		return true;
	}
	else {
		return false;
	}
}

// Whether to block the page
var shouldBlockPage = false;

function main() {
	if (shouldBlockPage) return;

	// Products and keywords that are normally used in headers
	var products = ["microsoft", "windows", "apple", "mac", "chrome", "firefox", "android", "ios", "internet explorer", "mcafee antivirus", "itunes"];
	var keywords = ["error", "security", "warning", "official", "support", "hotline", "virus", "infected", "infection", "blocked", "alert", "notification"];

	// Get the page's title
	var title = document.title.toLowerCase();
	var titleWords = title.split(" ");

	// Loop whether a product and keywords exist together
	// Only perform this check if the title length is under a certain number of words, to prevent news articles and other website false positives
	if (titleWords.length <= 5) {
		for (let i = 0; i < products.length; i++) {
			if (title.includes(products[i].toLowerCase())) {
				for (let x = 0; x < keywords.length; x++) {
					if (title.includes(keywords[x].toLowerCase())) {
						console.log("Blocked by title keyword: " + keywords[x]);
						shouldBlockPage = true;
					}
				}
			}
		}
	}

	// If the page hasn't been blocked, use flags until a decision is made
	var redFlags = 0;

	// If the page title is related to a product, flag it
	for (let i = 0; i < products.length; i++) {
		if (title.includes(products[i].toLowerCase())) {
			redFlags++;
		}
	}

	// after a second, if the title hasn't updated, flag it
	if (elapsedTime(timer, 1)) {
		if (title.includes(location.hostname) || title === "") {
			redFlags++;
		}
	}

	// flag IP addresses that do not resolve to domain names
	if (location.hostname.match(/\d+\.\d+\.\d+\.\d+/)) {
		redFlags++;
	}

	// flag bad (free) website hosts
	var badHosts = ["000webhost", "googleapi", "cloudfront", "amazonaws"];
	for (let i = 0; i < badHosts.length; i++) {
		if (location.hostname.includes(badHosts[i].toLowerCase())) {
			redFlags++;
		}
	}

	// flag bad domain TLDs
	// TODO: consider subdomain.websitename.tld (eg. for .us and .in.net particularly)
	var badTLDs = [".pw", ".site", ".club", ".gq", ".cf", ".us", ".xyz", ".bid", ".ga", ".ml", ".tk", ".in.net", ".win", ".info", ".icu", ".ru", ".live", ".website", ".online", ".loan", ".men", ".click", ".date", ".cloud", ".accountant", ".accountants", ".stream", ".download", ".country", ".vip", ".jetzt", ".xin", ".gdn", ".racing", ".top", ".work", ".ren", ".kim", ".mom", ".party", ".review", ".trade", ".wang"];
	var domainTLDCount = (location.hostname.match(/\./g) || []).length;
	if (domainTLDCount === 1) {
		for (let i = 0; i < badTLDs.length; i++) {
			if (location.hostname.endsWith(badTLDs[i].toLowerCase())) {
				redFlags++;
			}
		}
	}

	// Get all inline script tags, and check whether they contain obfuscated JS techniques, and flag them
	var scripts = document.getElementsByTagName(script);
	for (let i = 0; i < scripts.length; i++) {
		var script = scripts[i].innerText;
		if (script.includes("eval(")) redFlags++;
		if (script.includes("unescape(")) redFlags++;
		if (script.includes("fromCharCode(") || script.includes("charCodeAt(")) redFlags++;
		var numberOfEncodedSigns = (script.match(/%/g) || []).length;
		if (numberOfEncodedSigns >= 50) redFlags++;
		if (script.includes("document.documentElement.requestFullscreen") || script.includes("document.documentElement.mozRequestFullScreen")) redFlags++;
	}

	// Block the page if there are too many red flags
	if (redFlags >= 3) {
		console.log("Blocked by red flags");
		shouldBlockPage = true;
	}

	// TODO: Create multiple phrase arrays with differing weights, and possibly implement levenstein distance, and arrays of definite collocations
	// Scan the page for commonly used phrases
	var phrases = ["alert from microsoft", "windows computer is infected", "microsoft windows warning", "your computer was locked", "this computer is blocked", "your computer is blocked", "your computer has been blocked", "your computer has been infected", "your computer has alerted us", "call microsoft toll free", "windows has detected", "your system detected", "please call microsoft", "ransomware virus has infected your system", "trying to steal financial information", "information is being stolen", "removal process over the phone", "prevent your computer from being disabled", "pornographic spyware", "malicious virus", "malicious malware", "mac os is infected", "if you leave your mac os will remain damaged", "if you leave this site your mac os will remain damaged", "phishing/spyware were found on your mac", "banking information are at risk", "if you close this page, your computer access will be disabled", "your computer access will be disabled to prevent further damage", "call us within the next 5 minutes to prevent your computer from being disabled", "enter windows registration key to unblock", "do not close this window and restart your computer", "your computer's registration key is unblocked", "has been blocked under instructions of a competent us government authority", "under this url is an offence in law", "contact microsoft engineer", "do not ignore this important warning", "suspicious activity detected on your ip address", "due to harmful virus installed in your computer", "contact microsoft helpline to reactivate your computer", "this window is sending virus over the internet", "is hacked or used from undefined location", "your system detected some unusual activity", "it might harm your computer data and track your financial activities", "there is a system file missing due to some harmfull virus", "debug malware error, system failure", "the following data may be compromised", "do not ignore this critical alert", "your computer access will be disabled to prevent further damage to our network", "our engineers can guide you through the phone removal process", "microsoft security tollfree", "error # dt00X02", "error # dt00X2", "contact_microsoft_support", "system_protect - protect_error", "to secure your data and windows system click here", "windows operating system alert", "windows & internet browser updates are needed to patch new security flaws and / or fix bugs in the system", "rdn/yahlover.worm!", "apple security breach!", "your device is being targeted right now", "call apple support (toll-free)", "use this phone number to connect apple technical support", "ios security crash", "error #748b-12", "stop transferring your personal data and photos!", "you close this page, your computer access will be disabled", "for avoid further damage to our network", "our computer has alerted us that it was infected", "learn more about safe browsing get information about", "windows was blocked due to questionable activity", "please stop or restart your computer", "the pre-scan found possible traces of", "your system is at risk of irreversible damage", "scanning and cleaning is advised to prevent further system damage", "microsoft warning alert", "microsoft warning  alert", "mal1cious p0rn0graphic", "error #0x80072ee7", "your system data has been compromized", "hackers may track your financial activities and get access to your personal files on this system", "this virus is sending your confidential information", "error number #278D5", "we will be forced to disable your computer", "your computer is in critical state", "your iphone has been locked", "has been locked due to detected illegal activity", "immediately call apple support to unlock", "we couldn't activate windows", "ios security crash", "windows is asking for authentication", "call microsoft help desk", "technicians can guide you through the whole process over the phone", "contact our certified windows technicians", "your windows computer is at high risk", "windows security has detected", "the latest software, scan your system, and prevent your files from being deleted", "windows malware detected", "malware detected\/hard drive problem", "do not open internet browser for your security issue", "contact technicians at tollfree helpline", "someone is trying to steal your banking details", "drive safety delete in starting in", "call google chrome", "your information (for example, passwords, messages, and credit cards) have been stolen", "experienced technicians can help you activate", "technicians will access your computer 100% securely", "remotely activate your AV protection for you", "download your active subscription", "lot of antivirus software’s is available in the market", "keeps your computer protected in very a simple way", "in almost all the latest microsoft operating systems", "data in your computer are always on the verge of risk", "we analyze different errors and then we resolve them", "[OS_NAME] の問題を修復する方法"];

	// Get page content
	var page = "";
	if (document.head) page += document.head.innerText.toLowerCase();
	if (document.body) page += document.body.innerText.toLowerCase();

	// Detect phrases
	for (let i = 0; i < phrases.length; i++) {
		if (page.indexOf(phrases[i].toLowerCase()) > -1) {
			console.log("Blocked by page phrasing: " + phrases[i]);
			shouldBlockPage = true;
		}
	}
}

// Block the page, by clearing its content and replacing it
var finishedBlocking = false;
function blockPage() {
	if (shouldBlockPage && !finishedBlocking) {
		// Stop page from loading further
		window.stop();
		// Clear the header
		document.getElementsByTagName('head')[0].innerHTML = "<title>" + document.title + "</title>";
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
		// Rewrite problematic JS functions
		resetFullscreen();
		document.write = null;
		document.body.appendChild = null;
		window.onbeforeunload = null;
		window.eval = null;
		window.alert = null;
		if (window.jQuery) $ = null;
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
