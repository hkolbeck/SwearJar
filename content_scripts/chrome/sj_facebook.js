let storage = chrome.storage.sync;
setInterval(buildFinder("[role=presentation]", storage, checkEnabled(storage, "checkFacebook")), 500)