const api = typeof browser === "undefined" ? chrome : browser;

document.addEventListener("DOMContentLoaded", (event) => {
	// Récupère les valeurs enregistrées
	api.storage.sync.get(["workTime", "breakTime"], function (result) {
		// Définit les valeurs par défaut pour les champs du formulaire
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
			event.preventDefault(); // Empêche le rechargement de la page

			// Récupère les valeurs des champs du formulaire
			var workTimeHours = document.getElementById("workTimeHours").value;
			var workTimeMinutes = document.getElementById("workTimeMinutes").value;
			var workTimeSeconds = document.getElementById("workTimeSeconds").value;
			var workTime = `${workTimeHours}:${workTimeMinutes}:${workTimeSeconds}`;

			var breakTimeHours = document.getElementById("breakTimeHours").value;
			var breakTimeMinutes = document.getElementById("breakTimeMinutes").value;
			var breakTimeSeconds = document.getElementById("breakTimeSeconds").value;
			var breakTime = `${breakTimeHours}:${breakTimeMinutes}:${breakTimeSeconds}`;

			// Enregistre les valeurs dans le stockage persistant
			api.storage.sync.set(
				{ workTime: workTime, breakTime: breakTime },
				function () {
					console.log("Options saved.");
				}
			);
		});
});
