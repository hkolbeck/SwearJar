function checkEnabled(storage, key) {
    return fun => {
        storage.get([key], result => {
            if (result[key]) {
                fun()
            }
        })
    }
}

function buildFinder(selector, storage, checkEnabled, elementTraverser) {
    if (!elementTraverser) {
        elementTraverser = e => e
    }

    return () => {
        checkEnabled(() => {
            let editors = document.querySelectorAll(selector)
            if (editors.length === 0) {
                return
            }

            storage.get(['badWords'], result => {
                if (!result.badWords || result.badWords.length === 0) {
                    return
                }

                let badWordPatterns = result.badWords.map(word =>
                    new RegExp(`(^|[\\P{Letter}])(${word.replace(/\xa0/g, ' +')})([\\P{Letter}]|$)`, "iug"))
                editors.forEach(editor => {
                    let anyMatched = false
                    let textContent = editor.textContent;
                    for (let i = 0; i < badWordPatterns.length; i++) {
                        if (badWordPatterns[i].test(textContent)) {
                            anyMatched = true
                            break
                        }
                    }

                    setWarnState(editor, elementTraverser, storage, anyMatched)
                })
            })
        })
    }
}

let previousWarnState = false
function setWarnState(editor, elementTraverser, storage, shouldWarn) {
    let toAlter = elementTraverser(editor)
    if (shouldWarn) {
        storage.get(['warnColor', 'warnAudio'], result => {
            if (!previousWarnState) {
                playAudio(result.warnAudio)
            }
            previousWarnState = true
            toAlter.style.backgroundColor = result.warnColor
        })
    } else {
        previousWarnState = false
        toAlter.style.backgroundColor = "transparent"
    }
}

function playAudio(audio) {
    if (!audio) {
        return
    }

    let audioElement = document.createElement("audio")
    audioElement.src = audio
    audioElement.play().catch(err => console.log(`Couldn't play warning sound: ${err}`))
}
