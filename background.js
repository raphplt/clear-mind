const api = typeof browser === "undefined" ? chrome : browser;
let blockingEnabled = false; // Désactiver le blocage des sites par défaut

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
							// Injecter le code pour afficher le bloqueur
							document.body.innerHTML = "<h1>This site is blocked!</h1>";
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
		blockingEnabled = true; // Activer le blocage des sites
		console.log("Blocking enabled");
	} else if (message.action === "stopTimer") {
		blockingEnabled = false; // Désactiver le blocage des sites
		console.log("Blocking disabled");
	}
});
