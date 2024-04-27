const api = typeof browser === "undefined" ? chrome : browser;
const blockedSites = ["instagram.com", "youtube.com", "twitter.com"];
let shouldBlockSites = false;

// Connexion au port pour communiquer avec le script de fond
const port = api.runtime.connect({ name: "contentScript" });

function blockSite() {
	const currentUrl = window.location.href;
	if (
		shouldBlockSites &&
		blockedSites.some((site) => currentUrl.includes(site))
	) {
		window.location.href = api.runtime.getURL("blocked.html");
		console.log("Site bloqué");
	} else {
		console.log("Site non bloqué");
	}
}

function blockSites() {
	// Écoute des messages provenant du script de fond
	port.onMessage.addListener(function (message) {
		if (message.action === "timerStarted") {
			console.log("Timer démarré");
			shouldBlockSites = true;
			blockSite();
		} else if (message.action === "timerEnded") {
			console.log("Timer terminé");
			shouldBlockSites = false;
			if (blockedSites.some((site) => window.location.href.includes(site))) {
				window.history.back();
			}
		}
	});
}

// Appel de la fonction pour bloquer les sites
blockSites();
// Bloque les sites immédiatement lorsque le script de contenu est chargé
blockSite();
