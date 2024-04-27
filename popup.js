let timerInterval;
let timerRunning = false;
const api = typeof browser === "undefined" ? chrome : browser;
const startStopButton = document.getElementById("startStopTimerButton");

document.addEventListener("DOMContentLoaded", function () {
	api.storage.local.get(
		["startTime", "totalTimeInSeconds", "timerValue", "timerRunning"],
		function (result) {
			const timerDisplay = document.getElementById("timerDisplay");
			timerRunning = result.timerRunning || false; // Récupérer l'état du timer
			if (result.startTime && result.totalTimeInSeconds) {
				const elapsedSeconds = Math.floor((Date.now() - result.startTime) / 1000);
				const remainingSeconds = result.totalTimeInSeconds - elapsedSeconds;
				if (remainingSeconds > 0) {
					console.log("Remaining seconds: " + remainingSeconds);
					startTimer(remainingSeconds);
					startStopButton.textContent = "Stop Timer";
					timerDisplay.value = formatTime(
						Math.floor(remainingSeconds / 3600),
						Math.floor((remainingSeconds % 3600) / 60),
						remainingSeconds % 60
					);

					if (timerRunning) {
						timerInterval = setInterval(function () {
							const elapsedSeconds = Math.floor(
								(Date.now() - result.startTime) / 1000
							);
							const remainingSeconds = result.totalTimeInSeconds - elapsedSeconds;
							timerDisplay.value = formatTime(
								Math.floor(remainingSeconds / 3600),
								Math.floor((remainingSeconds % 3600) / 60),
								remainingSeconds % 60
							);
						}, 1000);
					}
				} else {
					console.log("Time is up!");
					stopTimer();
					resetTimerDisplay();
					startStopButton.textContent = "Start Timer";
				}
			} else {
				console.log("No data found in storage");
				resetTimerDisplay();
			}

			startStopButton.addEventListener("click", toggleTimer);
			document.getElementById("add-10").addEventListener("click", addTime);
			document.getElementById("remove-10").addEventListener("click", removeTime);
		}
	);
});

function toggleTimer() {
	if (timerRunning) {
		stopTimer();
		startStopButton.textContent = "Start focus";
		startStopButton.style.backgroundColor = "#B1E08A";
	} else {
		startTimer();
		startStopButton.textContent = "Reset";
		startStopButton.style.backgroundColor = "#FF9999";
	}
}

function startTimer(remainingSeconds) {
	if (!timerRunning) {
		const timerDisplay = document.getElementById("timerDisplay");
		const timeParts = timerDisplay.value.split(":");
		const hours = parseInt(timeParts[0]);
		const minutes = parseInt(timeParts[1]);
		const seconds = parseInt(timeParts[2]);

		let totalTimeInSeconds;

		if (remainingSeconds !== undefined) {
			totalTimeInSeconds = remainingSeconds;
		} else {
			totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
		}

		timerInterval = setInterval(function () {
			if (totalTimeInSeconds <= 0) {
				clearInterval(timerInterval);
				alert("Time is up!");
				timerRunning = false;
				return;
			}
			totalTimeInSeconds--;
			updateTimerDisplay(totalTimeInSeconds);

			api.storage.local.set({
				timerValue: timerDisplay.value,
				totalTimeInSeconds: totalTimeInSeconds,
			});
		}, 1000);

		timerRunning = true;
		api.storage.local.set({
			timerRunning: true,
			startTime: Date.now(),
			totalTimeInSeconds: totalTimeInSeconds,
		});
		api.runtime.sendMessage({
			action: "startTimer",
			duration: totalTimeInSeconds,
		});
	}
}

function stopTimer() {
	clearInterval(timerInterval);
	timerRunning = false;
	api.storage.local.set({ timerRunning: false });
	api.storage.local.remove(["startTime", "totalTimeInSeconds"]);

	resetTimerDisplay();
	api.runtime.sendMessage({ action: "stopTimer" });

	chrome.storage.local.remove("timerValue");
}

function resetTimerDisplay() {
	const defaultTime = "00:30:00";
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
	api.storage.local.set({
		totalTimeInSeconds: totalSeconds,
	});
}

function formatTime(hours, minutes, seconds) {
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
	return (number < 10 ? "0" : "") + number;
}
