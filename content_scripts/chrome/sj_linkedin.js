let storage = chrome.storage.sync;
setInterval(buildFinder(".editor-container", storage, checkEnabled(storage, "checkLinkedin")), 500)
