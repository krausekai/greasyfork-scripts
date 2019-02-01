// ==UserScript==
// @name         Scam Site Blocker
// @namespace    blockWinScamSites
// @version      3.5
// @description  Block potential windows and mac scam site popups and redirects
// @author       Kai Krause <kaikrause95@gmail.com>
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

// do not run on these excluded websites
var exclusions = ["microsoft.com", "apple.com", "github.com", "greasyfork.org", "wikipedia.org", "reddit.com", "google.com", "live.com", "mozilla.org", "youtube.com", "facebook.com", "twitter.com", "mcafee.com", "mcafeesecure.com", "mcafeemobilesecurity.com", "norton.com", "avg.com", "avast.com", "avira.com", "instagram.com", "kaspersky.com", "bitdefender.com", "malwarebytes.com", "sophos.com", "comodo.com", "av-test.org", "forbes.com", "howtogeek.com", "pcworld.com", "pandasecurity.com", "eset.com", "f-secure.com", "clamwin.com", "360totalsecurity.com"];
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

	// Safe keywords to lower false positives
	var safeKeywords = ["review", "scam"];

	// Products and keywords that are normally used in headers
	var products = ["microsoft", "windows", "apple", "mac", "chrome", "firefox", "android", "ios", "internet explorer", "mcafee", "norton", "itunes"];
	var badKeywords = ["error", "security", "warning", "warnung", "official", "support", "hotline", "virus", "infected", "infection", "infetto", "blocked", "alert", "notification", "antivirus"];

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
						console.log("Blocked by title keyword: " + badKeywords[x]);
						shouldBlockPage = true;
						break;
					}
				}
			}
		}
	}

	// If the page hasn't been blocked, use flags until a decision is made
	var redFlags = 0;

	// If the site address or page title is related to a product, flag it
	for (let i = 0; i < products.length; i++) {
		if (location.hostname.includes(products[i].toLowerCase()) || title.includes(products[i].toLowerCase())) {
			//console.log("Site address or page title is related to a product and flagged");
			redFlags++;
		}
	}

	// after a second, if the title hasn't updated, flag it
	if (elapsedTime(timer, 1)) {
		if (title.includes(location.hostname) || title === "") {
			//console.log("Empty hostname or title flagged");
			redFlags++;
		}
	}

	// flag IP addresses that do not resolve to domain names
	if (location.hostname.match(/\d+\.\d+\.\d+\.\d+/)) {
		//console.log("Hostname flagged");
		redFlags++;
	}

	// flag bad (free) website hosts
	var badHosts = ["000webhost", "googleapi", "cloudfront", "amazonaws"];
	for (let i = 0; i < badHosts.length; i++) {
		if (location.hostname.includes(badHosts[i].toLowerCase())) {
			//console.log("Web host flagged");
			redFlags++;
		}
	}

	// flag bad domain TLDs
	// TODO: consider subdomain.websitename.tld (eg. for .us and .in.net particularly)
	// https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#ICANN-era_generic_top-level_domains
	var badTLDs = ["academy", "accountant", "accountants", "active", "actor", "ads", "adult", "agency", "airforce", "analytics", "apartments", "app", "army", "art", "associates", "attorney", "auction", "audible", "audio", "author", "auto", "autos", "aws", "baby", "band", "bar", "barefoot", "bargains", "baseball", "basketball", "beauty", "beer", "best", "bestbuy", "bet", "bible", "bid", "bike", "bingo", "biz", "black", "blackfriday", "blockbuster", "blog", "blue", "boo", "book", "boots", "bot", "boutique", "box", "broadway", "broker", "build", "builders", "business", "buy", "buzz", "cab", "cafe", "call", "cam", "camera", "camp", "cancerresearch", "capital", "car", "cards", "care", "career", "careers", "cars", "case", "cash", "casino", "catering", "catholic", "center", "cern", "ceo", "cfd", "channel", "chat", "cheap", "christmas", "church", "cipriani", "circle", "city", "claims", "cleaning", "click", "clinic", "clothing", "cloud", "club", "coach", "codes", "coffee", "college", "community", "company", "compare", "computer", "condos", "construction", "consulting", "contact", "contractors", "cooking", "cool", "country", "coupon", "coupons", "courses", "credit", "creditcard", "cruise", "cricket", "cruises", "dad", "dance", "data", "date", "dating", "day", "deal", "deals", "degree", "delivery", "democrat", "dental", "dentist", "design", "dev", "diamonds", "diet", "digital", "direct", "directory", "discount", "diy", "docs", "doctor", "dog", "domains", "dot", "download", "drive", "duck", "earth", "eat", "education", "email", "energy", "engineer", "engineering", "enterprises", "equipment", "estate", "events", "exchange", "expert", "exposed", "express", "fail", "faith", "family", "fan", "fans", "farm", "fashion", "fast", "feedback", "film", "final", "finance", "financial", "fire", "fish", "fishing", "fit", "fitness", "flights", "florist", "flowers", "foo", "food", "foodnetwork", "football", "forsale", "forum", "foundation", "free", "frontdoor", "fun", "fund", "furniture", "fyi", "gallery", "game", "games", "garden", "gdn", "gift", "gifts", "gives", "glass", "global", "gold", "golf", "gop", "graphics", "gripe", "grocery", "group", "guide", "guitars", "guru", "hair", "hangout", "health", "healthcare", "help", "here", "hiphop", "hiv", "hockey", "holdings", "holiday", "homegoods", "homes", "homesense", "horse", "hospital", "host", "hosting", "hot", "hotels", "house", "how", "ice", "icu ", "industries", "ing", "ink", "institute[74]", "insurance", "insure", "international", "investments", "jewelry", "jobs", "joy", "kim", "kitchen", "land", "latino", "lawyer", "lease", "legal", "life", "lifeinsurance", "lighting", "like", "limited", "limo", "link", "live", "living", "loan", "loans", "locker", "lol", "lotto", "love", "luxury", "makeup", "management", "map", "market", "marketing", "markets", "mba", "med", "media", "meet", "meme", "memorial", "men", "menu", "mint", "mobi", "mobile", "mobily", "moe", "mom", "money", "mortgage", "motorcycles", "mov", "movie", "name", "navy", "network", "new", "news", "ninja", "now", "observer", "off", "one", "onl", "online", "ooo", "open", "origins", "page", "partners", "parts", "party", "pay", "pet", "phone", "photo", "photography", "photos", "pics", "pictures", "pid", "pin", "pink", "pizza", "place", "plumbing", "plus", "poker", "porn", "press", "prime", "pro", "productions", "prof", "promo", "properties", "property", "protection", "pub", "qpon", "racing", "radio", "read", "realestate", "realty", "recipes", "red", "rehab", "ren", "rent", "rentals", "repair", "report", "republican", "rest", "restaurant", "review", "reviews", "rich", "rip", "rocks", "rodeo", "room", "rugby", "run", "safe", "sale", "save", "scholarships", "school", "science", "search", "secure", "security", "select", "services", "sex", "sexy", "shoes", "shop", "shopping", "show", "showtime", "silk", "singles", "site", "ski", "skin", "sky", "sling", "smile", "soccer", "social", "software", "solar", "solutions", "song", "space", "spot", "spreadbetting", "storage", "store", "stream", "studio", "study", "style", "sucks", "supplies", "supply", "support", "surf", "surgery", "systems", "talk", "tattoo", "tax", "taxi", "team", "tech", "technology", "tennis", "theater", "theatre", "tickets", "tips", "tires", "today", "tools", "top", "tours", "town", "toys", "trade", "trading", "training", "travelersinsurance", "trust", "tube", "tunes", "uconnect", "university", "vacations", "ventures", "vet", "video", "villas", "vip", "vision", "vodka", "voting", "voyage", "wang", "watch", "watches", "weather", "webcam", "website", "wed", "wedding", "whoswho", "wiki", "win", "wine", "winners", "work", "works", "world", "wow", "wtf", "xxx", "xyz", "yachts", "yoga", "you", "zero", "zone", "shouji", "tushu", "wanggou", "weibo", "xihuan", "arte", "clinique", "luxe", "maison", "moi", "rsvp", "sarl", "epost", "haus", "immobilien", "jetzt", "kaufen", "kinder", "reisen", "schule", "versicherung", "desi", "shiksha", "casa", "immo", "moda", "bom", "passagens", "gratis", "futbol", "hoteles", "juegos", "soy", "tienda", "uno", "viajes", "vuelos", "pw", "gq", "cf", "us", "ga", "ml", "tk", "in.net", "ru", "xin", "zip", "ws", "dk"];

	//var domainTLDCount = (location.hostname.match(/\./g) || []).length;
	//if (domainTLDCount >= 1) {
		for (let i = 0; i < badTLDs.length; i++) {
			if (location.hostname.endsWith(badTLDs[i].toLowerCase())) {
				//console.log("TLD Flagged");
				redFlags++;
			}
		}
	//}

	// Get all inline script tags, and check whether they contain obfuscated JS techniques, and flag them
	var scripts = document.getElementsByTagName(script);
	for (let i = 0; i < scripts.length; i++) {
		var script = scripts[i].innerText;
		if (script.includes("eval(")) redFlags++;
		if (script.includes("unescape(")) redFlags++;
		if (script.includes("fromCharCode(") || script.includes("charCodeAt(")) redFlags++;
		if (script.includes("Aes.cipher")) redFlags++;
		if (script.includes("Aes.Ctr.decrypt")) redFlags++;
		var numberOfEncodedSigns = (script.match(/%/g) || []).length;
		if (numberOfEncodedSigns >= 50) redFlags++;
		if (script.includes("document.documentElement.requestFullscreen") || script.includes("document.documentElement.mozRequestFullScreen")) redFlags++;
		//console.log("flagged suspicious js")
	}

	// Block the page if there are too many red flags
	if (redFlags >= 3) {
		console.log("Blocked by red flags");
		shouldBlockPage = true;
	}

	// TODO: Create multiple phrase arrays with differing weights, and possibly implement levenstein distance, and arrays of definite collocations
	// Scan the page for commonly used phrases
	var phrases = ["alert from microsoft", "windows computer is infected", "microsoft windows warning", "your computer was locked", "this computer is blocked", "your computer is blocked", "your computer has been blocked", "your computer has been infected", "your computer has alerted us", "call microsoft toll free", "windows has detected", "your system detected", "please call microsoft", "ransomware virus has infected your system", "trying to steal financial information", "information is being stolen", "removal process over the phone", "prevent your computer from being disabled", "pornographic spyware", "malicious virus", "malicious malware", "mac os is infected", "if you leave your mac os will remain damaged", "if you leave this site your mac os will remain damaged", "phishing/spyware were found on your mac", "banking information are at risk", "if you close this page, your computer access will be disabled", "your computer access will be disabled to prevent further damage", "call us within the next 5 minutes to prevent your computer from being disabled", "enter windows registration key to unblock", "do not close this window and restart your computer", "your computer's registration key is unblocked", "has been blocked under instructions of a competent us government authority", "under this url is an offence in law", "contact microsoft engineer", "do not ignore this important warning", "suspicious activity detected on your ip address", "due to harmful virus installed in your computer", "contact microsoft helpline to reactivate your computer", "this window is sending virus over the internet", "is hacked or used from undefined location", "your system detected some unusual activity", "it might harm your computer data and track your financial activities", "there is a system file missing due to some harmfull virus", "debug malware error, system failure", "the following data may be compromised", "do not ignore this critical alert", "your computer access will be disabled to prevent further damage to our network", "our engineers can guide you through the phone removal process", "microsoft security tollfree", "error # dt00X02", "error # dt00X2", "contact_microsoft_support", "system_protect - protect_error", "to secure your data and windows system click here", "windows operating system alert", "windows & internet browser updates are needed to patch new security flaws and / or fix bugs in the system", "rdn/yahlover.worm!", "apple security breach!", "your device is being targeted right now", "call apple support (toll-free)", "use this phone number to connect apple technical support", "ios security crash", "error #748b-12", "stop transferring your personal data and photos!", "you close this page, your computer access will be disabled", "for avoid further damage to our network", "our computer has alerted us that it was infected", "learn more about safe browsing get information about", "windows was blocked due to questionable activity", "please stop or restart your computer", "the pre-scan found possible traces of", "your system is at risk of irreversible damage", "scanning and cleaning is advised to prevent further system damage", "microsoft warning alert", "microsoft warning  alert", "mal1cious p0rn0graphic", "your system data has been compromized", "hackers may track your financial activities and get access to your personal files on this system", "this virus is sending your confidential information", "error number #278D5", "we will be forced to disable your computer", "your computer is in critical state", "your iphone has been locked", "has been locked due to detected illegal activity", "immediately call apple support to unlock", "we couldn't activate windows", "ios security crash", "windows is asking for authentication", "call microsoft help desk", "technicians can guide you through the whole process over the phone", "contact our certified windows technicians", "your windows computer is at high risk", "windows security has detected", "the latest software, scan your system, and prevent your files from being deleted", "windows malware detected", "malware detected\/hard drive problem", "do not open internet browser for your security issue", "contact technicians at tollfree helpline", "someone is trying to steal your banking details", "drive safety delete in starting in", "google chrome critical error!", "call google chrome", "your information (for example, passwords, messages, and credit cards) have been stolen", "experienced technicians can help you activate", "technicians will access your computer 100% securely", "remotely activate your AV protection for you", "download your active subscription", "lot of antivirus software’s is available in the market", "keeps your computer protected in very a simple way", "in almost all the latest microsoft operating systems", "data in your computer are always on the verge of risk", "we analyze different errors and then we resolve them", "[OS_NAME] の問題を修復する方法", "windows-hat einige verdächtige", "aktivitäten von ihrer ip-adresse erkannt", "debug browser spyware 895-system 32.exe", "please contact Microsoft certified technicians to rectify the issue", "do not use any internet based services", "einige viren und spyware haben eine sicherheitslücke", "error # dw6vb37", "su ordenador está bloqueado", "no ignore este mensaje de error", "windows defender está examinando el equipo", "security system has detected the threatening attempt to gain access", "perform temporary block of all of your accounts", "millions of viruses seeking to exploit security loopholes to access private information on your computers", "is an independent provider of technical support for computer", "is an independent software reseller and we provide softwares and support", "is a reviews, information and self-help website providing troubleshooting", "to immediately rectify issue and prevent data loss", "hard drive safety delete starting in", "your hard drive will be deleted if you close this page", "you have a koobface virus", "268D3-XC00037 virus", "collectively, our team is able to handle a very wide array of tech issues", "si ricorda che una volta rubati questi dati potrebbero essere utilizzati per secondi fini", "segua le indicazioni fornite dall'operatore", "your pc is heavily damaged", "please download the pc cleanup application to remove", "ransomware 2.0", "trojan.win32.sendip.15", "@*fg/windows.exe", "@*fg\\windows.exe", "windowsが深刻な損傷を受けています", "コンピュータからウイルスを削除するには、Advanced PC Fixer", "e.tre456_worm_Windows", "を発見しましたことで破損営業システム", "タップスネーク", "tapsnake; crondns", "dubfish.icv", "/os/apps/snake.icv", "apps/hidden/system32/x/snake.exe", "our diagnosis shows that your computer still has errors", "call us now to get 1 year subscription of advanced pc care for free", "ask for your free pc diagnosis by our award wining technical team", "ie security update...", "edge security update...", "firefox security update...", "chrome security update...", "your subscription to mcafee total protection for windows has expired", "windows security center: your mcafee subscription has expired", "you have been randomly selected to test the new iphone", "You are invited to test our new iPhone", "your ip address - has been randomly selected", "your ip address has been randomly selected", "access to your computer has been restricted", "error # 3658d5546db22ca", "windows 7 driver optimizer", "windows 8 driver optimizer", "windows 10 driver optimizer", "driversupport is a five star rated download", "your computer has been locked", "system activation error code: 0x44578", "might infected by the trojans", "because system activation key has expired & your information", "I lost all hope once I lost all of my messages. Luckily,", "When none of my password recovery processes were working,", "your video player for windows might be out of date!", "your windows system is damaged", "your version of software is damaged and obsolete", "click on the \"update\" button to install the newest software to scan and protect your files from being deleted", "the immediate removal of the viruses is required to prevent further system damage, loss of apps, photos, or other files", "please download the reimage repair application to remove", "ERROR # 268d3x8938", "ERROR # MS-SYSINFO32", "microsoft diagnostics ip address:", "connects you to an independent third party service provider of technical support", "I don’t have enough knowledge about the installation process but with the help of right technician it became possible for me without any error", "We ensure Word, Excel, PPT or Outlook help you to take right conclusions timely.", "Our Support helps to work with latest version of MS office tools anytime as it arrives.", "We are here to assist you with different MS Office problems you are facing", "send otp to support team", "your antivirus software requires an update", "dear chrome user, congratulations", "dear firefox user, congratulations", "dear safari user, congratulations", "dear opera user, congratulations"];

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
		var head = document.getElementsByTagName('head');
		if (head[0]) head[0].innerHTML = "<title>" + document.title + "</title>";
		// Rewrite the body
		if (!document.body) {
			setTimeout(() => {
				document.body = document.createElement("body");
				fillBody();
			}, 0);
		}
		else {
			fillBody();
		}
		// Rewrite problematic JS functions
		resetFullscreen();
		document.write = null;
		document.body.appendChild = null;
		window.onbeforeunload = null;
		window.history.pushState = null
		window.eval = null;
		window.alert = null;
		if (window.jQuery) $ = null;
		// Finished
		finishedBlocking = true;
	}
}

function fillBody() {
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
