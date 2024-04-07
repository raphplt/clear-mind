chrome.runtime.onInstalled.addListener(function () {
	console.log("Extension Installed or Updated");
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.action === "startTimer") {
		const duration = message.duration;
		startTimer(duration);
	}
});

function startTimer(duration) {
	const endTime = Date.now() + duration * 60 * 1000; // Fin du timer en millisecondes
	chrome.storage.local.set({ timerEndTime: endTime }, function () {
		console.log("Timer started for " + duration + " minutes");
		// Envoie un message à la popup avec la durée du timer
		chrome.runtime.sendMessage({ action: "timerStarted", duration: duration });
	});
}

// Fonction pour mettre à jour le timer
function updateTimer() {
	chrome.storage.local.get(["timerEndTime"], function (result) {
		const endTime = result.timerEndTime;
		if (endTime) {
			const remainingTime = Math.max(0, endTime - Date.now());
			// Envoie un message à la popup avec le temps restant
			chrome.runtime.sendMessage({
				action: "timerUpdate",
				remainingTime: remainingTime,
			});
		}
	});
}

// Met à jour le timer toutes les secondes
setInterval(updateTimer, 1000);
