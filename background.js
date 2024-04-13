const api = typeof browser === "undefined" ? chrome : browser;
let popupPort = null;
let timerId = null;

api.runtime.onConnect.addListener(function (port) {
	if (port.name === "popup") {
		popupPort = port;
		popupPort.onDisconnect.addListener(function () {
			popupPort = null;
		});
	}
});

api.runtime.onInstalled.addListener(function () {
	console.log("Extension Installed or Updated");
});

api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log("Message received in background script: ", message);
	if (message.action === "popupReady") {
		popupReady = true;
	} else if (message.action === "startTimer") {
		const duration = message.duration;
		startTimer(duration);
	} else if (message.action === "stopTimer") {
		stopTimer();
	}
});

function startTimer(duration) {
	const endTime = Date.now() + duration * 60 * 1000;
	api.storage.local.set({ timerEndTime: endTime }, function () {
		console.log("Timer started for " + duration + " minutes");
		if (popupPort) {
			console.log("Sending timerStarted message to popup");
			popupPort.postMessage({ action: "timerStarted", duration: duration });
		} else {
			console.log("Popup not ready");
		}
		timerId = setInterval(updateTimer, 1000);
	});

	// Active les règles de blocage des sites
	// api.declarativeNetRequest.updateDynamicRules({
	// 	addRules: [{ id: 1 }, { id: 2 }, { id: 3 }],
	// });
}

function updateTimer() {
	api.storage.local.get(["timerEndTime"], function (result) {
		const endTime = result.timerEndTime;
		if (endTime) {
			const remainingTime = Math.max(0, endTime - Date.now());
			if (popupPort) {
				popupPort.postMessage({
					action: "timerUpdate",
					remainingTime: remainingTime,
				});
			} else {
				console.log("Popup not ready");
			}
		}
	});
}

function stopTimer() {
	console.log("Stopping timer and clearing storage");
	api.storage.local.remove("timerEndTime", function () {
		console.log("Timer stopped");
		if (popupPort) {
			popupPort.postMessage({ action: "timerStopped" });
		} else {
			console.log("Popup not ready");
		}
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	});

	if (api.declarativeNetRequest) {
		api.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [1, 2, 3],
		});
	} else {
		console.log("Declarative Net Request API not available");
	}
}
