const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", function () {
	const startTimerButton = document.getElementById("startTimerButton");
	const timerDurationInput = document.getElementById("timerDurationInput");
	const timerDisplay = document.getElementById("timerDisplay");
	const stopTimerButton = document.getElementById("stopTimerButton");

	const port = api.runtime.connect({ name: "popup" });

	// Récupère l'état du timer à l'ouverture de la popup
	api.storage.local.get(["timerRunning"], function (result) {
		if (result.timerRunning) {
			startTimerButton.disabled = true;
			stopTimerButton.disabled = false;
		} else {
			startTimerButton.disabled = false;
			stopTimerButton.disabled = true;
		}
	});

	startTimerButton.addEventListener("click", function () {
		const duration = parseInt(timerDurationInput.value);
		if (!startTimerButton.disabled && duration > 0) {
			api.runtime.sendMessage({ action: "startTimer", duration: duration });
			startTimerButton.disabled = true;
			stopTimerButton.disabled = false;
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
			startTimerButton.disabled = false;
			stopTimerButton.disabled = true;
			updateTimerDisplay(0);
		} else if (message.action === "timerUpdate") {
			updateTimerDisplay(message.remainingTime);
		}
	});

	function updateTimerDisplay(remainingTime) {
		const minutes = Math.floor(remainingTime / (1000 * 60));
		const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
		timerDisplay.textContent = `Time remaining: ${minutes}:${
			seconds < 10 ? "0" : ""
		}${seconds}`;
	}

	stopTimerButton.addEventListener("click", function () {
		api.runtime.sendMessage({ action: "stopTimer" });
		console.log("Stopping timer");
	});
});
