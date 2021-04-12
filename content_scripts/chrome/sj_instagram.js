let storage = chrome.storage.sync;
setInterval(buildFinder("textarea", storage, checkEnabled(storage, "checkInstagram")), 500)