const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", function () {
	const startTimerButton = document.getElementById("startTimerButton");
	const timerDisplay = document.getElementById("timerDisplay");
	const stopTimerButton = document.getElementById("stopTimerButton");
	const resetTimerButton = document.getElementById("resetTimerButton");
	const add10MinutesButton = document.getElementById("add-10");
	const remove10MinutesButton = document.getElementById("remove-10");

	const port = api.runtime.connect({ name: "popup" });

	add10MinutesButton.addEventListener("click", function () {
		const durationParts = timerDisplay.value.split(":");
		let hours = parseInt(durationParts[0]);
		let minutes = parseInt(durationParts[1]);
		let seconds = parseInt(durationParts[2]);
		minutes += 10;
		if (minutes >= 60) {
			hours += 1;
			minutes -= 60;
		}
		timerDisplay.value = `${hours < 10 ? "0" : ""}${hours}:${
			minutes < 10 ? "0" : ""
		}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	});

	remove10MinutesButton.addEventListener("click", function () {
		const durationParts = timerDisplay.value.split(":");
		let hours = parseInt(durationParts[0]);
		let minutes = parseInt(durationParts[1]);
		let seconds = parseInt(durationParts[2]);
		minutes -= 10;
		if (minutes < 0) {
			hours -= 1;
			minutes += 60;
		}
		if (hours < 0) {
			hours = 0;
			minutes = 0;
		}
		timerDisplay.value = `${hours < 10 ? "0" : ""}${hours}:${
			minutes < 10 ? "0" : ""
		}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	});
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
		const duration = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]); //
		if (!startTimerButton.disabled && duration > 0) {
			api.runtime.sendMessage({ action: "startTimer", duration: duration });
			startTimerButton.style.display = "none";
			stopTimerButton.style.display = "block";
			api.storage.local.set({ timerRunning: true });
		} else {
			alert("Please enter a valid timer duration");
		}
	});

	port.onMessage.addListener(function (message, sender, sendResponse) {
		if (message.action === "timerStarted") {
			console.log("Timer started");
			updateTimerDisplay(message.duration * 60 * 1000);
		} else if (message.action === "timerStopped") {
			api.storage.local.set({ timerRunning: false });
			startTimerButton.style.display = "block";
			stopTimerButton.style.display = "none";
			timerDisplay.value = "00:30:00";
		} else if (message.action === "timerUpdate") {
			api.storage.local.get(["timerRunning"], function (result) {
				if (result.timerRunning) {
					updateTimerDisplay(message.remainingTime);
				}
			});
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
		startTimerButton.style.display = "block";
		stopTimerButton.style.display = "none";
		timerDisplay.value = "00:30:00";
	});

	resetTimerButton &&
		resetTimerButton.addEventListener("click", function () {
			timerDisplay.value = "00:30:00";
		});
});

