// ==UserScript==
// @name         Scam Site Blocker
// @namespace    blockWinScamSites
// @version      6.1
// @description  Block potential windows and mac scam site popups and redirects
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_unsafeWindow
// @run-at       document-start
// ==/UserScript==

// ---------------------
// AUTOFILL URL REPORTING
// ---------------------

if (location.hostname.toLowerCase().startsWith("safebrowsing.google.") && location.href.includes("/safebrowsing")) {
	window.addEventListener("DOMContentLoaded", function load() {
		var badUrl = new URL (location.href).searchParams.get("website");
		badUrl = decodeURIComponent(badUrl);
		document.getElementById("url").value = badUrl;
		document.getElementById("falseneg").checked = true;

		var textareas = document.getElementsByTagName("textarea");
		for (let i = 0; i < textareas.length; i++) {
			if (textareas[i].name && textareas[i].name === "dq") {
				textareas[i].value = "Possible scam website that compels visitors to call a number, and make a payment in order to unblock their computer";
				break;
			}
		}
	}, false);
}

// ---------------------
// PRE-RUN
// ---------------------

// do not run on these excluded websites
var exclusions = ["microsoft.com", "apple.com", "github.com", "greasyfork.org", "wikipedia.org", "reddit.com", "google.com", "live.com", "mozilla.org", "youtube.com", "facebook.com", "twitter.com", "mcafee.com", "mcafeesecure.com", "mcafeemobilesecurity.com", "norton.com", "avg.com", "avast.com", "avira.com", "instagram.com", "kaspersky.com", "bitdefender.com", "malwarebytes.com", "sophos.com", "comodo.com", "av-test.org", "forbes.com", "howtogeek.com", "pcworld.com", "pandasecurity.com", "eset.com", "f-secure.com", "clamwin.com", "360totalsecurity.com", "washingtonpost.com", "techspot.com", "vice.com", "theverge.com", "nytimes.com", "bloomberg.com", "discordapp.com", "skype.com", "outlook.com", "gmail.com", "theguardian.com", "bleepingcomputer.com", "malwaretips.com", "wired.co.uk", "zippyshare.com", "twitch.tv", "imasdk.googleapis.com", "imgur.com", "gfycat.com", "embedly.com", "openload.co"];

for (let i = 0; i < exclusions.length; i++) {
	if (location.hostname.toLowerCase().endsWith(exclusions[i])) return;
}

// ---------------------
// PREVENT TROUBLESOME
// JS BEFORE DETECTION
// ---------------------

var print = window.print;
unsafeWindow.print = null;

function restoreWindowJS() {
	unsafeWindow.print = print;
}

// ---------------------
// HELPER FUNCTIONS
// ---------------------

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

// Helper function to inject JS code into the page, for page-level access to JS functions and variables
var injectCode = function(f) {
	var script = document.createElement("script");
	script.textContent = "(" + f.toString() + "());";
	document.head.appendChild(script);
};

// ---------------------
// MAIN CODE
// ---------------------

// Whether to block the page
var shouldBlockPage = false;
if (GM_getValue(location.hostname) && GM_getValue(location.hostname) === "blocked") shouldBlockPage = true;

var reasonsToBlock = [];

function main() {
	if (shouldBlockPage) return;

	reasonsToBlock = [];

	// Block bad URL terms
	var badUrlTerms = ["call-now1", "call-now2", "firiedge", "ffiedge", "/processdll/", "jook.html", "chr-win-error", "Call-for-SecurityCH-Issues18"];
	for (let i = 0; i < badUrlTerms.length; i++) {
		if (location.href.toLowerCase().includes(badUrlTerms[i].toLowerCase())) {
			reasonsToBlock.push("Blocked by URL keyword: " + badUrlTerms[i])
			return shouldBlockPage = true;
		}
	}

	// Safe keywords to lower false positives
	var safeKeywords = ["review", "scam"];

	// Products and keywords that are normally used in headers
	var products = ["microsoft", "windows", "apple", "mac", "chrome", "firefox", "android", "ios", "internet explorer", "mcafee", "norton", "itunes"];
	var badKeywords = ["error", "security", "warning", "warnung", "official", "support", "hotline", "virus", "infected", "infection", "infetto", "blocked", "alert", "notification", "antivirus", "activation", "supportwarnung"];

	// Get the page's title
	var title = document.title.toLowerCase();
	var titleWords = title.split(" ");

	// Loop whether a product and badKeywords exist together
	// Only perform this check if the title length is under a certain number of words, to prevent news articles and other website false positives
	if (titleWords.length <= 5) {
		for (let i = 0; i < products.length; i++) {
			// ignore possible false positives
			let shouldContinue = true;
			for (let y = 0; y < safeKeywords.length; y++) {
				if (title.includes(safeKeywords[y])) {
					shouldContinue = false;
					break;
				}
			}
			if (!shouldContinue) continue;

			if (title.includes(products[i].toLowerCase())) {
				for (let x = 0; x < badKeywords.length; x++) {
					if (title.includes(badKeywords[x].toLowerCase())) {
						reasonsToBlock.push("Blocked by title keyword: " + badKeywords[x]);
						return shouldBlockPage = true;
					}
				}
			}
		}
	}

	// If the page hasn't been blocked, use flags until a decision is made
	var redFlags = 0;

	// If the site address or page title is related to a product, flag it
	for (let i = 0; i < products.length; i++) {
		if (location.hostname.includes(products[i].toLowerCase())) {
			//console.log("Site address or page title is related to a product and flagged");
			reasonsToBlock.push("Red Flag Detected - " + "Site Address/Page Title has term: " + products[i]);
			redFlags++;
		}
	}

	// after a second, if the title hasn't updated, flag it
	if (elapsedTime(timer, 1)) {
		if (title === location.hostname || title === "") {
			//console.log("Empty hostname or title flagged");
			reasonsToBlock.push("Red Flag Detected - " + "Page Title is URL or is empty");
			redFlags += 0.5;
		}
	}

	// flag IP addresses that do not resolve to domain names
	if (location.hostname.match(/\d+\.\d+\.\d+\.\d+/)) {
		//console.log("Hostname flagged");
		reasonsToBlock.push("Red Flag Detected - " + "URL is an IP address");
		redFlags++;
	}

	// flag bad (free) website hosts
	var badHosts = ["000webhost", "googleapi", "cloudfront", "amazonaws", "azurewebsites", "elasticbeanstalk"];
	for (let i = 0; i < badHosts.length; i++) {
		if (location.hostname.toLowerCase().includes(badHosts[i].toLowerCase())) {
			//console.log("Web host flagged");
			reasonsToBlock.push("Red Flag Detected - " + "Bad Website Host: " + badHosts[i]);
			redFlags++;
		}
	}

	// flag bad URL terms
	var badUrlTerms = ["call-now1", "call-now2", "mac-support", "p_num=", "call-for-microsoft-support", "/chx/", "/chmx/", "/AFUS", "/macx/", "firiedge", "ffiedge", "blue.php", "blue.html", "iphonereport/t7", "network_error", "/ysus", "/afuk", "/chr-win-error", "/processdll/", "jook.html", "USA.online", "/chrome_win/", "call-for-security-issues", "errornsel", "/macx", "Call-for-SecurityCH-Issues", "Call-Support1"];
	for (let i = 0; i < badUrlTerms.length; i++) {
		if (location.href.toLowerCase().includes(badUrlTerms[i].toLowerCase())) {
			//console.log("url term flagged");
			reasonsToBlock.push("Red Flag Detected - " + "Bad Page URL Term: " + badUrlTerms[i]);
			redFlags++;
		}
	}

	// flag bad domain TLDs
	// TODO: consider subdomain.websitename.tld (eg. for .us and .in.net particularly)
	// https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#ICANN-era_generic_top-level_domains
	var badTLDs = ["academy", "accountant", "accountants", "active", "actor", "ads", "adult", "agency", "airforce", "analytics", "apartments", "app", "army", "art", "associates", "attorney", "auction", "audible", "audio", "author", "auto", "autos", "aws", "baby", "band", "bar", "barefoot", "bargains", "baseball", "basketball", "beauty", "beer", "best", "bestbuy", "bet", "bible", "bid", "bike", "bingo", "biz", "black", "blackfriday", "blockbuster", "blog", "blue", "boo", "book", "boots", "bot", "boutique", "box", "broadway", "broker", "build", "builders", "business", "buy", "buzz", "cab", "cafe", "call", "cam", "camera", "camp", "cancerresearch", "capital", "car", "cards", "care", "career", "careers", "cars", "case", "cash", "casino", "catering", "catholic", "center", "cern", "ceo", "cfd", "channel", "chat", "cheap", "christmas", "church", "cipriani", "circle", "city", "claims", "cleaning", "click", "clinic", "clothing", "cloud", "club", "coach", "codes", "coffee", "college", "community", "company", "compare", "computer", "condos", "construction", "consulting", "contact", "contractors", "cooking", "cool", "country", "coupon", "coupons", "courses", "credit", "creditcard", "cruise", "cricket", "cruises", "dad", "dance", "data", "date", "dating", "day", "deal", "deals", "degree", "delivery", "democrat", "dental", "dentist", "design", "dev", "diamonds", "diet", "digital", "direct", "directory", "discount", "diy", "docs", "doctor", "dog", "domains", "dot", "download", "drive", "duck", "earth", "eat", "education", "email", "energy", "engineer", "engineering", "enterprises", "equipment", "estate", "events", "exchange", "expert", "exposed", "express", "fail", "faith", "family", "fan", "fans", "farm", "fashion", "fast", "feedback", "film", "final", "finance", "financial", "fire", "fish", "fishing", "fit", "fitness", "flights", "florist", "flowers", "foo", "food", "foodnetwork", "football", "forsale", "forum", "foundation", "free", "frontdoor", "fun", "fund", "furniture", "fyi", "gallery", "game", "games", "garden", "gdn", "gift", "gifts", "gives", "glass", "global", "gold", "golf", "gop", "graphics", "gripe", "grocery", "group", "guide", "guitars", "guru", "hair", "hangout", "health", "healthcare", "help", "here", "hiphop", "hiv", "hockey", "holdings", "holiday", "homegoods", "homes", "homesense", "horse", "hospital", "host", "hosting", "hot", "hotels", "house", "how", "ice", "icu", "industries", "ing", "ink", "institute", "insurance", "insure", "international", "investments", "jewelry", "jobs", "joy", "kim", "kitchen", "land", "latino", "lawyer", "lease", "legal", "life", "lifeinsurance", "lighting", "like", "limited", "limo", "link", "live", "living", "loan", "loans", "locker", "lol", "lotto", "love", "luxury", "makeup", "management", "map", "market", "marketing", "markets", "mba", "med", "media", "meet", "meme", "memorial", "men", "menu", "mint", "mobi", "mobile", "mobily", "moe", "mom", "money", "mortgage", "motorcycles", "mov", "movie", "name", "navy", "network", "new", "news", "ninja", "now", "observer", "off", "one", "onl", "online", "ooo", "open", "origins", "page", "partners", "parts", "party", "pay", "pet", "phone", "photo", "photography", "photos", "pics", "pictures", "pid", "pin", "pink", "pizza", "place", "plumbing", "plus", "poker", "porn", "press", "prime", "pro", "productions", "prof", "promo", "properties", "property", "protection", "pub", "qpon", "racing", "radio", "read", "realestate", "realty", "recipes", "red", "rehab", "ren", "rent", "rentals", "repair", "report", "republican", "rest", "restaurant", "review", "reviews", "rich", "rip", "rocks", "rodeo", "room", "rugby", "run", "safe", "sale", "save", "scholarships", "school", "science", "search", "secure", "security", "select", "services", "sex", "sexy", "shoes", "shop", "shopping", "show", "showtime", "silk", "singles", "site", "ski", "skin", "sky", "sling", "smile", "soccer", "social", "software", "solar", "solutions", "song", "space", "spot", "spreadbetting", "storage", "store", "stream", "studio", "study", "style", "sucks", "supplies", "supply", "support", "surf", "surgery", "systems", "talk", "tattoo", "tax", "taxi", "team", "tech", "technology", "tennis", "theater", "theatre", "tickets", "tips", "tires", "today", "tools", "top", "tours", "town", "toys", "trade", "trading", "training", "travelersinsurance", "trust", "tube", "tunes", "uconnect", "university", "vacations", "ventures", "vet", "video", "villas", "vip", "vision", "vodka", "voting", "voyage", "wang", "watch", "watches", "weather", "webcam", "website", "wed", "wedding", "whoswho", "wiki", "win", "wine", "winners", "work", "works", "world", "wow", "wtf", "xxx", "xyz", "yachts", "yoga", "you", "zero", "zone", "shouji", "tushu", "wanggou", "weibo", "xihuan", "arte", "clinique", "luxe", "maison", "moi", "rsvp", "sarl", "epost", "haus", "immobilien", "jetzt", "kaufen", "kinder", "reisen", "schule", "versicherung", "desi", "shiksha", "casa", "immo", "moda", "bom", "passagens", "gratis", "futbol", "hoteles", "juegos", "soy", "tienda", "uno", "viajes", "vuelos", "pw", "gq", "cf", "us", "ga", "ml", "tk", "in.net", "ru", "xin", "zip", "ws", "dk"];

	for (let i = 0; i < badTLDs.length; i++) {
		if (location.hostname.toLowerCase().endsWith(badTLDs[i].toLowerCase())) {
			//console.log("TLD Flagged");
			reasonsToBlock.push("Red Flag Detected - " + "Bad TLD blocked: " + badTLDs[i]);
			redFlags++;
		}
	}

	// flag if an autoplay audio tag is present
	if (document.head && document.head.innerHTML.toLowerCase().match("<audio.+autoplay=(.|)(\"|\'|)autoplay")) {
		reasonsToBlock.push("Red Flag Detected - " + "Autoplaying Audio in Page Head");
		redFlags++;
	}
	if (document.body && document.body.innerHTML.toLowerCase().match("<audio.+autoplay=(.|)(\"|\'|)autoplay")) {
		reasonsToBlock.push("Red Flag Detected - " + "Autoplaying Audio in Page Body");
		redFlags++;
	}

	// flag if an iframe audio tag is present
	if (document.head && document.head.innerHTML.toLowerCase().match("<iframe.+src=(.|)(\"|\').+\.(mp3|mpga|aac|ogg).+>")) {
		reasonsToBlock.push("Red Flag Detected - " + "Autoplaying Audio in Page Head");
		redFlags++;
	}
	if (document.body && document.body.innerHTML.toLowerCase().match("<iframe.+src=(.|)(\"|\').+\.(mp3|mpga|aac|ogg).+>")) {
		reasonsToBlock.push("Red Flag Detected - " + "Autoplaying Audio in Page Body");
		redFlags++;
	}

	// Get all inline script tags, and check whether they contain obfuscated JS techniques, and flag them
	var scriptElements = document.getElementsByTagName("script");
	var scripts = "";
	for (let i = 0; i < scriptElements.length; i++) {
		scripts += scriptElements[i].innerText;
	}

	scripts = scripts.toLowerCase();

	if (scripts.includes("fromcharcode(") || scripts.includes("charcodeat(")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: fromCharCode() or charCodeAt()");
		redFlags += 0.35;
	}
	if (scripts.includes("eval(")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: eval()");
		redFlags += 0.35;
	}
	if (scripts.includes("unescape(")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: unescape()");
		redFlags += 0.35;
	}
	var numberOfEncodedSigns = (scripts.match(/%/g) || []).length;
	if (numberOfEncodedSigns >= 50) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: Overly encoded JS with %");
		redFlags += 0.35;
	}
	var numberOfBackSlashes = (scripts.match(/\\/g) || []).length;
	if (numberOfBackSlashes >= 50) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: Overly encoded JS with backslash");
		redFlags += 0.35;
	}
	if (scripts.includes("\(p\,a\,c\,k\,e\,d\)")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: packed");
		redFlags += 0.5;
	}
	if (scripts.includes("aes.cipher")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: Aes.cipher()");
		redFlags += 0.5;
	}
	if (scripts.includes("aes.ctr.decrypt")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: Aes.Ctr.decrypt()");
		redFlags += 0.5;
	}
	if (scripts.includes(".requestfullscreen") || scripts.includes(".mozrequestfullscreen") || scripts.includes("webkitfullscreenchange")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: requestFullscreen");
		redFlags += 0.5;
	}
	if (scripts.includes("document.write(phone)") || scripts.includes("document.write(getURLParameter(\"p_num\"))")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: document.write(phone)");
		redFlags += 1.5;
	}
	if (scripts.includes("\[\"pushstate\"\, \"onbeforeunload\"\, \"\"\, \"returnvalue\"\, \"onload\"\, \"tostring\"\]")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: pushState");
		redFlags += 1.5;
	}
	if (scripts.includes("onbeforeunload=function() {alert (\"??????? ESC")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: atypical onbeforeunload");
		redFlags += 1.5;
	}
	if (scripts.includes("setInterval(function () { alert(") || scripts.includes("setInterval(function () { window.alert(")) {
		reasonsToBlock.push("Red Flag Detected - " + "Bad JS: setInterval with window.alert");
		redFlags += 1.5;
	}


	// detect empty text bodies
	if (document.body && document.body.innerText.length === 0) {
		reasonsToBlock.push("Red Flag Detected - " + "Page has no body content");
		redFlags += 0.5;
	}

	// detect repeated iframes and flag each one (that are used to freeze up browsers and further annoy the user)
	if (document.body) {
		var bodyHtml = document.body.innerHTML;
		bodyHtml = bodyHtml.replace(/\r|\n/gmi, "") // remove new lines, to properly detect regex

		var iframes = bodyHtml.split("</iframe>");
		var iframeSrcs = [];

		for (var i = 0; i < iframes.length; i++) {
			var iframeSrc = /\<iframe.+\ssrc\=\"(.+)\"/igm.exec(iframes[i]);
			if (iframeSrc && iframeSrc[1]) {
				if (iframeSrcs.indexOf(iframeSrc[1]) === -1) iframeSrcs.push(iframeSrc[1]);
				else {
					reasonsToBlock.push("Red Flag Detected - " + "Page has duplicate iframes");
					redFlags += 0.25;
				}
			}
		}
	}

	// detect whether the right-click context menu is blocked
	if (document.body && document.body.getAttribute("oncontextmenu") && document.body.getAttribute("oncontextmenu") === "return false") {
		reasonsToBlock.push("Red Flag Detected - " + "Right-click context menu has been removed");
		redFlags += 0.35;
	}

	// detect whether the body cursor has been replaced
	if (document.body && document.body.getAttribute("style")) {
		var bodyStyle = document.body.getAttribute("style").toLowerCase();
		if (bodyStyle.includes("cursor: url(") && bodyStyle.includes("crosshair;")) {
			reasonsToBlock.push("Red Flag Detected - " + "Browser cursor has been replaced");
			redFlags += 0.35;
		}
	}

	// detect fake 'additional dialog' checkbox form
	if (document.body && (new RegExp(/\<input.+\"checkbox.+prevent this page from creating additional dialogues/igm)).test(document.body.innerHTML)) {
		reasonsToBlock.push("Red Flag Detected - " + "Fake additional dialogue checkbox form");
		redFlags++;
	}

	// TODO: Create multiple phrase arrays with differing weights, and possibly implement levenstein distance, and arrays of definite collocations
	// Scan the page for commonly used phrases
	var phrases = ["alert from microsoft", "windows computer is infected", "microsoft windows warning", "your computer was locked", "this computer is blocked", "your computer is blocked", "your computer has been blocked", "your computer has been infected", "your computer has alerted us", "call microsoft toll free", "windows has detected", "your system detected", "please call microsoft", "ransomware virus has infected your system", "trying to steal financial information", "information is being stolen", "removal process over the phone", "prevent your computer from being disabled", "pornographic spyware", "mac os is infected", "if you leave your mac os will remain damaged", "if you leave this site your mac os will remain damaged", "phishing/spyware were found on your mac", "banking information are at risk", "if you close this page, your computer access will be disabled", "your computer access will be disabled to prevent further damage", "call us within the next 5 minutes to prevent your computer from being disabled", "enter windows registration key to unblock", "do not close this window and restart your computer", "your computer's registration key is unblocked", "has been blocked under instructions of a competent us government authority", "under this url is an offence in law", "contact microsoft engineer", "do not ignore this important warning", "suspicious activity detected on your ip address", "due to harmful virus installed in your computer", "contact microsoft helpline to reactivate your computer", "this window is sending virus over the internet", "is hacked or used from undefined location", "your system detected some unusual activity", "it might harm your computer data and track your financial activities", "there is a system file missing due to some harmfull virus", "debug malware error, system failure", "the following data may be compromised", "do not ignore this critical alert", "your computer access will be disabled to prevent further damage to our network", "our engineers can guide you through the phone removal process", "microsoft security tollfree", "error # dt00X02", "error # dt00X2", "contact_microsoft_support", "system_protect - protect_error", "to secure your data and windows system click here", "windows operating system alert", "windows & internet browser updates are needed to patch new security flaws and / or fix bugs in the system", "rdn/yahlover.worm!", "RDN/YahVee.worm!","apple security breach!", "your device is being targeted right now", "call apple support (toll-free)", "use this phone number to connect apple technical support", "ios security crash", "error #748b-12", "stop transferring your personal data and photos!", "you close this page, your computer access will be disabled", "for avoid further damage to our network", "our computer has alerted us that it was infected", "learn more about safe browsing get information about", "windows was blocked due to questionable activity", "please stop or restart your computer", "the pre-scan found possible traces of", "your system is at risk of irreversible damage", "scanning and cleaning is advised to prevent further system damage", "microsoft warning alert", "microsoft warning  alert", "mal1cious p0rn0graphic", "your system data has been compromized", "hackers may track your financial activities and get access to your personal files on this system", "this virus is sending your confidential information", "error number #278D5", "we will be forced to disable your computer", "your computer is in critical state", "your iphone has been locked", "has been locked due to detected illegal activity", "immediately call apple support to unlock", "we couldn't activate windows", "ios security crash", "windows is asking for authentication", "call microsoft help desk", "technicians can guide you through the whole process over the phone", "contact our certified windows technicians", "your windows computer is at high risk", "windows security has detected", "the latest software, scan your system, and prevent your files from being deleted", "windows malware detected", "malware detected\/hard drive problem", "do not open internet browser for your security issue", "contact technicians at tollfree helpline", "someone is trying to steal your banking details", "drive safety delete in starting in", "google chrome critical error!", "call google chrome", "your information (for example, passwords, messages, and credit cards) have been stolen", "experienced technicians can help you activate", "technicians will access your computer 100% securely"];
	var phrasesb = ["remotely activate your AV protection for you", "download your active subscription", "lot of antivirus software’s is available in the market", "keeps your computer protected in very a simple way", "in almost all the latest microsoft operating systems", "data in your computer are always on the verge of risk", "we analyze different errors and then we resolve them", "[OS_NAME] の問題を修復する方法", "windows-hat einige verdächtige", "aktivitäten von ihrer ip-adresse erkannt", "debug browser spyware 895-system 32.exe", "please contact Microsoft certified technicians to rectify the issue", "do not use any internet based services", "einige viren und spyware haben eine sicherheitslücke", "error # dw6vb37", "su ordenador está bloqueado", "no ignore este mensaje de error", "windows defender está examinando el equipo", "security system has detected the threatening attempt to gain access", "perform temporary block of all of your accounts", "millions of viruses seeking to exploit security loopholes to access private information on your computers", "is an independent provider of technical support for computer", "is an independent software reseller and we provide softwares and support", "is a reviews, information and self-help website providing troubleshooting", "to immediately rectify issue and prevent data loss", "hard drive safety delete starting in", "your hard drive will be deleted if you close this page", "you have a koobface virus", "268D3-XC00037 virus", "collectively, our team is able to handle a very wide array of tech issues", "si ricorda che una volta rubati questi dati potrebbero essere utilizzati per secondi fini", "segua le indicazioni fornite dall'operatore", "your pc is heavily damaged", "please download the pc cleanup application to remove", "ransomware 2.0", "trojan.win32.sendip.15", "@*fg/windows.exe", "@*fg\\windows.exe", "windowsが深刻な損傷を受けています", "コンピュータからウイルスを削除するには、Advanced PC Fixer", "e.tre456_worm_Windows", "を発見しましたことで破損営業システム", "タップスネーク", "tapsnake; crondns", "dubfish.icv", "/os/apps/snake.icv", "apps/hidden/system32/x/snake.exe", "our diagnosis shows that your computer still has errors", "call us now to get 1 year subscription of advanced pc care for free", "ask for your free pc diagnosis by our award wining technical team", "ie security update...", "edge security update...", "firefox security update...", "chrome security update...", "your subscription to mcafee total protection for windows has expired", "windows security center: your mcafee subscription has expired", "you have been randomly selected to test the new iphone", "You are invited to test our new iPhone", "your ip address - has been randomly selected", "your ip address has been randomly selected", "access to your computer has been restricted", "error # 3658d5546db22ca", "windows 7 driver optimizer", "windows 8 driver optimizer", "windows 10 driver optimizer", "driversupport is a five star rated download", "your computer has been locked", "system activation error code: 0x44578", "might infected by the trojans", "because system activation key has expired & your information", "I lost all hope once I lost all of my messages. Luckily,", "When none of my password recovery processes were working,", "your video player for windows might be out of date!", "your windows system is damaged", "your version of software is damaged and obsolete", "click on the \"update\" button to install the newest software to scan and protect your files from being deleted", "the immediate removal of the viruses is required to prevent further system damage, loss of apps, photos, or other files", "please download the reimage repair application to remove", "ERROR # 268d3x8938", "ERROR # MS-SYSINFO32", "microsoft diagnostics ip address", "connects you to an independent third party service provider of technical support", "I don’t have enough knowledge about the installation process but with the help of right technician it became possible for me without any error", "We ensure Word, Excel, PPT or Outlook help you to take right conclusions timely.", "Our Support helps to work with latest version of MS office tools anytime as it arrives.", "We are here to assist you with different MS Office problems you are facing", "send otp to support team", "your antivirus software requires an update", "dear chrome user, congratulations", "dear firefox user, congratulations", "dear safari user, congratulations", "dear opera user, congratulations", "dear windows user, the website you have recently visited may have downloaded the malware and virus", "please do not try to shut down or restart your computer.it may lock your computer permanently or erase your hard disk", "your tcp connection was blocked by your windows security system", "windows defender alert : error code # 0x3e7", "Microsoft Security Tollfree", "Why we blocked your computer?", "Enter Windows registration key to unblock", "windows update can not continue as your software copy is expired\/corrupt", "error code: 0x00aem001489", "Blue Screen Error 0x000000CE", "for the purpose of verification enter your windows product key", "Error # XR01F5", "Your computer has alerted us that it has been infected with a Pornographic Spyware", "windows wurde aufgrund verdächtiger aktivitäten blockiert", "the window's registration key is illegal", "your apple device has been locked due to security reasons", "ihr system ist durch die ungewöhnliche", "This window is using pirated software", "we block this computer for your security", "Don't close this window! It's important!", "microsoft security sans frais", "alerte de virus de microsoft", "nous avons verrouillé cet ordinateur pour votre sécurité", "ne fermez pas cette fenétre et ne redémarrez pas votre ordinateur sans appeler le support", "do not close this window or restart your computer without calling support", "pornographic virus alert from microsoft", "contact the microsoft helpline to reactivate your computer", "contactez le service d'assistance téléphonique microsoft pour réactiver votre ordinateur", "we have detected a virus from a pornographic website", "it might corrupt your data and track your financial activities", "we have locked this computer for your security", "Error: 110898-1907316996"];
	var phrasesc = ["windows firewall has detected that your windows", "Please note: Windows security has detected that the system is corrupted and outdated", "Click on the \"Update\" button to install the latest software to scan and prevent your files from being deleted", "DO NOT PRESS ANY KEY UNTIL YOUR KNOW SAFE SIDE INSTRUCTIONS", "a Microsoft Super Technician is waiting to guide you to safeguard your system", "You must not avoid this warning, as this is very critical infection", "Microsoft Super Technicians are level 9 technicians which are expertise in resolving these kind of issues", "ATTENTION: Trojan Windows 7 Process", "is a hidden monitoring software that tracks your personal information", "this information can be sent to hackers or third parties to damage your computer", "Your system has detected zeus virus", "Firewall detecting 'suspicious' incoming network connections", "Automatically report details of possible security incidents to Google.", "Your apple id has been disabled!", "This Mac computer is BLOCKED", "Do not close this warning or restart your", "Your Mac's registration key is Blocked", "The Mac's registration key is illegal", "This Mac is using pirated software", "This Mac is sending virus over the internet", "is hacked or used from undefined location", "It might harm your Mac's data and track your financial activities", "Contact Our Certified Windows Technicians For Immediate Assistance", "Windows Has Detected a Malicious Virus On Your System", "Warning! A Full System Scan is Required", "Further action through this computer or any computer on the network will reveal private information", "The pre-scan found traces of (2) malware", "is required immediately to prevent further system damage, loss of Apps, Photos or other files", "Personal and banking information are at risk", "If you leave this site your Mac OS  will remain damaged and vulnerable", "is infected with Spyware and other malicious applications", "Spyware must be removed and system damage repaired", "Error: 79791-", "Error: 168219-", "If you exit this without solving issue, access to your computer will be removed to prevent further destruction to our network", "Ihr System erkennt ungewöhnliche Aktivitäten", "Bitte melden Sie diese Aktivität an", "Der Fensterregistrierungsschlüssel ist illegal", "Dieses Fenster verwendet Raubkopie", "Dieses Fenster sendet Viren über das Internet", "Dieses Fenster wird von einem unbestimmten Ort aus gehackt oder verwendet", "Wir haben diesen Computer zu Ihrer Sicherheit gesperrt", "Wenden Sie sich an den Microsoft Support, um Ihren Computer zu reaktivieren", "Warum sperren wir Ihren Computer?", "App: windows10manager (1).exe", "virus detected in your system registry", "call ms technical support", "if you exit this without solving issue, access to your computer will be removed", "access to your computer will be removed to prevent further destruction", "your pc has alerted us that it was infected with malware", "Virus Found: Tapsnake; CronDNS; Dubfishicv", "Any other action through this computer or any computer on the network will reveal private information", "System damage: 28.1%", "MAC OS is infected with spyware and other malicious applications", "Spyware must be removed and system damage repaired", "Microsoft Super Technicians are level 9", "DO NOT PRESS ANY KEY UNTIL YOU KNOW SAFE SIDE INSTRUCTIONS"];

	phrases = phrases.concat(phrasesb, phrasesc);

	// TODO - regex / multi-include captures?
	// System damage: 28.1% - Immediate removal required

	// special characters for re-writing scam phrase text
	// German: ä, ö, ü
	// Spanish: á, é, í, ó, ú, ü, ñ, ¿, ¡

	// Get page content
	var page = "";
	if (document.head) page += document.head.innerText.toLowerCase();
	if (document.body) page += document.body.innerText.toLowerCase();

	// Detect phrases
	for (let i = 0; i < phrases.length; i++) {
		if (page.indexOf(phrases[i].toLowerCase()) > -1) {
			reasonsToBlock.push("Page blocked due to phrase - " + phrases[i]);
			redFlags++;
			if (redFlags >= 3) break;
		}
	}

	// Block the page if there are too many red flags
	if (redFlags >= 3) {
		console.log("Blocked by red flags");
		return shouldBlockPage = true;
	}
}

// Block the page, by clearing its content and replacing it
var finishedBlocking = false;
function blockPage() {
	if (shouldBlockPage && !finishedBlocking) {
		// in case page is reloaded by javascript that cannot be intuitively blocked
		// set this page to be blocked immediately on the next opening
		// instead of waiting for the page to be detected as meeting blocking conditions
		GM_setValue(location.hostname, "blocked");

		// Stop page from loading further
		window.stop();

		// Rewrite the page
		if (!document.body) {
			setTimeout(() => {
				document.body = document.createElement("body");
				fillPage();
			}, 0);
		}
		else {
			fillPage();
		}

		// Finished
		finishedBlocking = true;
	}
}

function overrideJS() {
	window.onload = null;
	window.open = null;
	window.addEventListener = null;
	document.addEventListener = null;
	document.body.addEventListener = null;
	document.write = null;
	document.createElement = null;
	document.body.appendChild = null;
	window.onbeforeunload = null;
	window.history.pushState = null;
	window.eval = null;
	window.alert = null;
	document.querySelector = null;
	window.onbeforeprint = function() {window.print = null}
	window.print = null;
	document.onmousemove = null;
	document.onkeydown = null;
	document.onkeyup = null;
	window.onhashchange = null;
	document.oncontextmenu = null;
	document.onmousedown = null;
	document.onmouseup = null;

	if (window.jQuery) {
		$ = null;
		window.jQuery = null;
	}

	// Override fullscreen functions
	var elem = document.documentElement;
	if (elem.requestFullscreen) elem.requestFullscreen = null;
	// Firefox
	if (elem.mozRequestFullScreen) elem.mozRequestFullScreen = null;
	// Chrome, Safari and Opera
	if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen = null;
	/* IE/Edge */
	if (elem.msRequestFullscreen) elem.msRequestFullscreen = null;

	// Exit fullscreen functions
	setInterval(() => {
		try {
			if (document.exitFullscreen) document.exitFullscreen();
			// Firefox
			if (document.mozCancelFullScreen) document.mozCancelFullScreen();
			// Chrome, Safari and Opera
			if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			// IE/Edge
			if (document.msExitFullscreen) document.msExitFullscreen();
		} catch (e) {
			// console.error(e);
		}
	}, 500);
}

function fillPage() {
	// reset document head
	var head = document.getElementsByTagName('head');
	if (head && head[0]) {
		head[0].innerHTML = "<title>" + document.title + "</title>";
	}

	// rewrite the document with itself if it already existed, to remove event listeners
	var old_element = document.body;
	var new_element = old_element.cloneNode(true);
	old_element.parentNode.replaceChild(new_element, old_element);

	// reset styling on the body element
	document.body.className = "";
	document.body.style = "";

	// rewrite the document body contents with our warning message
	document.body.innerHTML = "<center><h2>Suspicious Site Blocked by <a href='#' id='authorlink' style='color:#F2F2F2;'><u>Scam Site Blocker</u></a></h2><br /></center>";
	document.body.innerHTML += "<center>This website may be operated by scammers. Go back or close this page.<br /><br /></center>";
	document.body.innerHTML += "<center>If you think otherwise, confirm the website address before ignoring this warning.<br /><br /></center>";
	document.body.innerHTML += "<center>If this warning seems accurate, please submit a report to Google to help protect others.<br /><br /></center>";
	document.body.innerHTML += "<center><button id='ignorePage'>Ignore Warning</button> <button id='reportPage'>Report to Google</button></center>";
	document.body.style.fontSize = "18px";
	document.body.style.color = "#F2F2F2";
	document.body.style.backgroundColor = "#931024";
	document.getElementById("ignorePage").style.padding = "6px";
	document.getElementById("reportPage").style.padding = "6px";

	document.body.innerHTML += "<br /><div id='reasonsForBlock' style='text-align:center'>" + "<div style='font-size: 12px'>" + reasonsToBlock.join("<br />") + "</div></div>"

	document.getElementById("authorlink").addEventListener("click", openAuthorPage);
	document.getElementById("ignorePage").addEventListener("click", ignorePage);
	document.getElementById("reportPage").addEventListener("click", reportPage);

	// inject the javascript override code into the page
	injectCode(overrideJS);

	// change head CSP
	if (head && head[0]) {
		head[0].innerHTML += "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src \'none\'; script-src \'unsafe-inline\'\"></meta>";
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

// report the current page
function reportPage() {
	var reportToUrl = "https://safebrowsing.google.com/safebrowsing/report_general/?" + "website=" + encodeURIComponent(window.location.href);
	window.open(reportToUrl);
}

// check if page is ignored
var isPageIgnored = GM_getValue(location.hostname);

// run code blocks
var runTime = Date.now();
if (isPageIgnored !== "ignored") {
	var interval = setInterval(function() {
		main();
		blockPage();

		// Restore JS functionality if page is safe
		if(!shouldBlockPage && (Date.now() - runTime) / 1000 >= 3) {
			restoreWindowJS();
		}

		// Remove interval if page has been blocked, or, the script has run for longer than 3 seconds
		if(shouldBlockPage || (Date.now() - runTime) / 1000 >= 3) {
			return clearInterval(interval);
		}
	}, 4);
}
