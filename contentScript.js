const api = typeof browser === "undefined" ? chrome : browser;
const blockedSites = ["instagram.com", "youtube.com", "twitter.com"];
let shouldBlockSites = false;

// Vérifie si la page actuelle correspond à l'un des sites bloqués et redirige si nécessaire
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

// Fonction pour bloquer les sites pendant le timer
function blockSites() {
	// Vérifie si le timer est en cours et bloque les sites si nécessaire
	api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
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
