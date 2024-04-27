let timerInterval;
let timerRunning = false;
const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("startTimerButton")
		.addEventListener("click", startTimer);
	document
		.getElementById("stopTimerButton")
		.addEventListener("click", stopTimer);
	document.getElementById("add-10").addEventListener("click", addTime);
	document.getElementById("remove-10").addEventListener("click", removeTime);
});

function startTimer() {
	if (!timerRunning) {
		const timerDisplay = document.getElementById("timerDisplay");
		const timeParts = timerDisplay.value.split(":");
		const hours = parseInt(timeParts[0]);
		const minutes = parseInt(timeParts[1]);
		const seconds = parseInt(timeParts[2]);

		let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

		timerInterval = setInterval(function () {
			if (totalTimeInSeconds <= 0) {
				clearInterval(timerInterval);
				alert("Time is up!");
				timerRunning = false;
				return;
			}
			totalTimeInSeconds--;
			updateTimerDisplay(totalTimeInSeconds);
		}, 1000);

		timerRunning = true;
		api.runtime.sendMessage({
			action: "startTimer",
			duration: totalTimeInSeconds,
		});
	}
}

function stopTimer() {
	clearInterval(timerInterval);
	timerRunning = false;
	resetTimerDisplay(); // Réinitialiser la valeur du timer à 30 minutes
	// Envoyer un message au background script pour arrêter le blocage des sites
	api.runtime.sendMessage({ action: "stopTimer" });
}

function resetTimerDisplay() {
	const defaultTime = "00:30:00"; // Valeur par défaut du timer (30 minutes)
	document.getElementById("timerDisplay").value = defaultTime;
}

function addTime() {
	const timerDisplay = document.getElementById("timerDisplay");
	const timeParts = timerDisplay.value.split(":");
	let hours = parseInt(timeParts[0]);
	let minutes = parseInt(timeParts[1]);
	let seconds = parseInt(timeParts[2]);

	minutes += 10;
	if (minutes >= 60) {
		hours++;
		minutes -= 60;
	}

	timerDisplay.value = formatTime(hours, minutes, seconds);
}

function removeTime() {
	const timerDisplay = document.getElementById("timerDisplay");
	const timeParts = timerDisplay.value.split(":");
	let hours = parseInt(timeParts[0]);
	let minutes = parseInt(timeParts[1]);
	let seconds = parseInt(timeParts[2]);

	minutes -= 10;
	if (minutes < 0) {
		if (hours > 0) {
			hours--;
			minutes += 60;
		} else {
			minutes = 0;
		}
	}

	timerDisplay.value = formatTime(hours, minutes, seconds);
}

function updateTimerDisplay(totalSeconds) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	document.getElementById("timerDisplay").value = formatTime(
		hours,
		minutes,
		seconds
	);
}

function formatTime(hours, minutes, seconds) {
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
	return (number < 10 ? "0" : "") + number;
}
