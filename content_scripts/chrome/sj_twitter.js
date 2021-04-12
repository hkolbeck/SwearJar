// Lord does twitter love their divs
function getAncestor(editor) {
    let div = editor
    for (let i = 0; i < 5; i++) {
        div = div.parentNode
    }

    return div
}

setInterval(buildFinder(".DraftEditor-root", chrome.storage.sync, getAncestor), 500)
