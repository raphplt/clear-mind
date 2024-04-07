document.addEventListener("DOMContentLoaded", function () {
	const startTimerButton = document.getElementById("startTimerButton");
	const timerDurationInput = document.getElementById("timerDurationInput");
	const timerDisplay = document.getElementById("timerDisplay");

	let timerInterval; // Variable pour stocker l'ID de l'intervalle du timer

	startTimerButton.addEventListener("click", function () {
		const duration = parseInt(timerDurationInput.value);
		if (duration > 0) {
			// Envoie un message au script de fond pour démarrer le timer
			chrome.runtime.sendMessage({ action: "startTimer", duration: duration });
		} else {
			alert("Please enter a valid timer duration");
		}
	});

	// Écoute les messages du script de fond
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		if (message.action === "timerUpdate") {
			updateTimerDisplay(message.remainingTime);
		}
	});

	// Fonction pour mettre à jour l'affichage du timer
	function updateTimerDisplay(remainingTime) {
		const minutes = Math.floor(remainingTime / (1000 * 60));
		const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
		timerDisplay.textContent = `Time remaining: ${minutes}:${
			seconds < 10 ? "0" : ""
		}${seconds}`;
	}
});
