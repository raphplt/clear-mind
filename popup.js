const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", function () {
	const startTimerButton = document.getElementById("startTimerButton");
	const timerDisplay = document.getElementById("timerDisplay");
	const stopTimerButton = document.getElementById("stopTimerButton");
	const resetTimerButton = document.getElementById("resetTimerButton");

	const port = api.runtime.connect({ name: "popup" });

	// Récupère l'état du timer à l'ouverture de la popup
	api.storage.local.get(["timerRunning"], function (result) {
		if (result.timerRunning) {
			startTimerButton.style.display = "none";
			stopTimerButton.style.display = "block";
		} else {
			startTimerButton.style.display = "block";
			stopTimerButton.style.display = "none";
		}
	});

	startTimerButton.addEventListener("click", function () {
		const durationParts = timerDisplay.value.split(":");
		const duration = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]); // Convert HH:MM to minutes
		if (!startTimerButton.disabled && duration > 0) {
			api.runtime.sendMessage({ action: "startTimer", duration: duration });
			startTimerButton.style.display = "none";
			stopTimerButton.style.display = "block";
			api.storage.local.set({ timerRunning: true }); // Stocke l'état du timer
		} else {
			alert("Please enter a valid timer duration");
		}
	});

	port.onMessage.addListener(function (message, sender, sendResponse) {
		if (message.action === "timerStarted") {
			console.log("Timer started");
			updateTimerDisplay(message.duration * 60 * 1000);
		} else if (message.action === "timerStopped") {
			api.storage.local.set({ timerRunning: false }); // Stocke l'état du timer
			startTimerButton.style.display = "block";
			stopTimerButton.style.display = "none";
			updateTimerDisplay(0);
		} else if (message.action === "timerUpdate") {
			updateTimerDisplay(message.remainingTime);
		}
	});

	function updateTimerDisplay(remainingTime) {
		const hours = Math.floor(remainingTime / (1000 * 60 * 60));
		const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
		timerDisplay.value = `${hours < 10 ? "0" : ""}${hours}:${
			minutes < 10 ? "0" : ""
		}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}

	stopTimerButton.addEventListener("click", function () {
		api.runtime.sendMessage({ action: "stopTimer" });
		console.log("Stopping timer");
		startTimerButton.style.display = "block";
		stopTimerButton.style.display = "none";
	});

	resetTimerButton.addEventListener("click", function () {
		timerDisplay.value = "00:30:00";
	});
});