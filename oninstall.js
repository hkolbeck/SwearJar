let defaultOptions = {
    warnColor: "#d4222b",
    badWords: [],
    warnAudio: "",
    checkTwitter: true,
    checkFacebook: true,
    checkLinkedin: true,
    checkInstagram: true
}

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
        chrome.storage.sync.set(defaultOptions, () => {
            chrome.runtime.openOptionsPage()
        })
    }
});