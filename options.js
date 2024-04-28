const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", (event) => {
	api.storage.sync.get(["workTime", "breakTime"], function (result) {
		if (result.workTime) {
			var [hours, minutes, seconds] = result.workTime.split(":");
			document.getElementById("workTimeHours").value = hours;
			document.getElementById("workTimeMinutes").value = minutes;
			document.getElementById("workTimeSeconds").value = seconds;
		}
		if (result.breakTime) {
			var [hours, minutes, seconds] = result.breakTime.split(":");
			document.getElementById("breakTimeHours").value = hours;
			document.getElementById("breakTimeMinutes").value = minutes;
			document.getElementById("breakTimeSeconds").value = seconds;
		}
	});

	document
		.getElementById("optionsForm")
		.addEventListener("submit", function (event) {
			event.preventDefault();

			var workTimeHours = document.getElementById("workTimeHours").value;
			var workTimeMinutes = document.getElementById("workTimeMinutes").value;
			var workTimeSeconds = document.getElementById("workTimeSeconds").value;
			var workTime = `${workTimeHours}:${workTimeMinutes}:${workTimeSeconds}`;

			var breakTimeHours = document.getElementById("breakTimeHours").value;
			var breakTimeMinutes = document.getElementById("breakTimeMinutes").value;
			var breakTimeSeconds = document.getElementById("breakTimeSeconds").value;
			var breakTime = `${breakTimeHours}:${breakTimeMinutes}:${breakTimeSeconds}`;

			api.storage.sync.set(
				{ workTime: workTime, breakTime: breakTime },
				function () {
					console.log("Options saved.");
				}
			);
		});
});
