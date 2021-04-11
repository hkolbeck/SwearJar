chrome.storage.sync.set({"badWords": ["crazy"], "warnColor": "red"})

function findEditors() {
    let editors = document.querySelectorAll("[role=presentation]")
    console.log(`Found ${editors.length} editors`)
    if (editors.length === 0) {
        return
    }

    chrome.storage.sync.get(['badWords'], result => {
        if (!result.badWords) {
            return
        }

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

function setWarnState(editor, shouldWarn) {
    if (shouldWarn) {
        chrome.storage.sync.get(['warnColor'], result => {
            editor.style.backgroundColor = result.warnColor
        })
    } else {
        editor.style.backgroundColor = "transparent"
    }
}

setInterval(findEditors, 500)