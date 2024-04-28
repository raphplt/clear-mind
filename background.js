const api = typeof browser === "undefined" ? chrome : browser;

// Récupère la valeur enregistrée de blockingEnabled
api.storage.sync.get(["blockingEnabled"], function (result) {
    let blockingEnabled = result.blockingEnabled || false;

    api.runtime.onInstalled.addListener(function () {
        api.storage.sync.set({
            blockedSites: ["instagram.com", "youtube.com", "twitter.com"],
        });
    });

    api.webNavigation.onDOMContentLoaded.addListener(function (details) {
        if (blockingEnabled) {
            api.storage.sync.get(["blockedSites"], function (result) {
                const blockedSites = result.blockedSites;
                const currentUrl = new URL(details.url);

                for (let blockedSite of blockedSites) {
                    if (currentUrl.hostname.includes(blockedSite)) {
                        api.scripting.executeScript({
                            target: { tabId: details.tabId },
                            func: () => {
                                document.body.innerHTML = "<h1> This site is blocked!</ > ";
                            },
                        });
                        break;
                    }
                }
            });
        }
    });

    api.runtime.onMessage.addListener(function (message) {
        if (message.action === "startTimer") {
            blockingEnabled = true;
            // Enregistre la nouvelle valeur de blockingEnabled
            api.storage.sync.set({ blockingEnabled: blockingEnabled }, function () {
                console.log("Blocking enabled");
            });
        } else if (message.action === "stopTimer") {
            blockingEnabled = false;
            // Enregistre la nouvelle valeur de blockingEnabled
            api.storage.sync.set({ blockingEnabled: blockingEnabled }, function () {
                console.log("Blocking disabled");
            });
        }
    });

    console.log("blocking enabled: ", blockingEnabled);
});