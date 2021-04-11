function findEditors() {
    let editors = document.querySelectorAll(".DraftEditor-root")
    if (editors.length === 0) {
        return
    }

    chrome.storage.sync.get(['badWords'], result => {
        let badWordPatterns = result.badWords.map(word => new RegExp(`(^|[\\P{Letter}])(${word})([\\P{Letter}]|$)`, "iug"))

        editors.forEach(editor => {
            let anyMatched = false
            let textContent = editor.textContent;
            for (let i = 0; i < badWordPatterns.length; i++) {
                if (badWordPatterns[i].test(textContent)) {
                    anyMatched = true
                    break
                }
            }

            setWarnState(editor, anyMatched)
        })
    })
}

// Lord does twitter love their divs
function getDistantAncestor(editor) {
    let div = editor
    for (let i = 0; i < 5; i++) {
        div = div.parentNode
    }

    return div
}

function setWarnState(editor, shouldWarn) {
    let ancestor = getDistantAncestor(editor)
    if (shouldWarn) {
        chrome.storage.sync.get(['warnColor'], result => {
            ancestor.style.backgroundColor = result.warnColor
        })
    } else {
        ancestor.style.backgroundColor = "transparent"
    }
}


setInterval(findEditors, 500)