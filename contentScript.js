const api = typeof browser === "undefined" ? chrome : browser;

// Fonction pour bloquer les sites pendant le timer
function blockSites() {
	const blockedSites = ["instagram.com", "youtube.com", "twitter.com"];
	const redirectUrl = api.runtime.getURL("blocked.html"); // Récupère l'URL de la page de blocage depuis l'extension

	// Vérifie si la page actuelle correspond à l'un des sites bloqués et redirige si nécessaire
	function blockSite() {
		const currentUrl = window.location.href;
		if (blockedSites.some((site) => currentUrl.includes(site))) {
			window.location.href = redirectUrl;
		}
	}

	// Vérifie si le timer est en cours et bloque les sites si nécessaire
	api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		if (message.action === "timerStarted") {
			blockSite();
		}
	});
}

// Appel de la fonction pour bloquer les sites
blockSites();
