// Lord does twitter love their divs
function getAncestor(editor) {
    let div = editor
    for (let i = 0; i < 5; i++) {
        div = div.parentNode
    }

    return div
}

let storage = chrome.storage.sync;
setInterval(buildFinder(".DraftEditor-root", storage, checkEnabled(storage, "checkTwitter"), getAncestor), 500)
