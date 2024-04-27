const api = typeof browser === "undefined" ? chrome : browser;
let blockingEnabled = false;

api.runtime.onInstalled.addListener(function () {
	api.storage.sync.set({
		blockedSites: ["instagram.com", "youtube.com", "twitter.com"],
	});
});

api.webNavigation.onDOMContentLoaded.addListener(function (details) {
	if (blockingEnabled) {
		api.storage.sync.get(["blockedSites"], function (result) {
			const blockedSites = result.blockedSites;
			const currentUrl = new URL(details.url);

			for (let blockedSite of blockedSites) {
				if (currentUrl.hostname.includes(blockedSite)) {
					api.scripting.executeScript({
						target: { tabId: details.tabId },
						func: () => {
							document.body.innerHTML = "<h1> This site is blocked!</ > ";
						},
					});
					break;
				}
			}
		});
	}
});

api.runtime.onMessage.addListener(function (message) {
	if (message.action === "startTimer") {
		blockingEnabled = true; 
		console.log("Blocking enabled");
	} else if (message.action === "stopTimer") {
		blockingEnabled = false; 
		console.log("Blocking disabled");
	}
});
