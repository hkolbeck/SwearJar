let changed = false

const configKeys = [
    "warnColor",
    "badWords",
    "warnAudio",
    "checkTwitter",
    "checkFacebook",
    "checkLinkedin",
    "checkInstagram"
]

const checkPairs = {
    checkTwitter: "twitter-check",
    checkFacebook: "fb-check",
    checkInstagram: "insta-check",
    checkLinkedin: "linkedin-check"
}

const audio = {
    "none_audio_choice": "",
    "bright_audio_choice": chrome.runtime.getURL("audio/bright.mp3"),
    "glassy_audio_choice": chrome.runtime.getURL("audio/glassy.mp3"),
    "womp_audio_choice": chrome.runtime.getURL("audio/womp.mp3"),
    "wooden_mallet_audio_choice": chrome.runtime.getURL("audio/wooden-mallet.mp3")
}

chrome.storage.sync.get(configKeys, result => {
    console.log(`Loading initial configuration: ${JSON.stringify(result)}`)

    let warnColor = result.warnColor ? result.warnColor : "#d4222b";
    let colorPicker = new iro.ColorPicker('#color-picker', {
        width: 320,
        color: warnColor
    });

    let colorPickerExamples = document.getElementById("color-picker-examples")
    colorPickerExamples.style.backgroundColor = warnColor
    colorPickerExamples.style.borderColor = warnColor

    colorPicker.on("color:change", () => {
        warnColor = colorPicker.color.hexString
        colorPickerExamples.style.backgroundColor = warnColor
        colorPickerExamples.style.borderColor = warnColor
        changed = true
    })

    const checkValues = {
        checkTwitter: result.checkTwitter ? result.checkTwitter : false,
        checkFacebook: result.checkFacebook ? result.checkFacebook : false,
        checkInstagram: result.checkInstagram ? result.checkInstagram : false,
        checkLinkedin: result.checkLinkedin ? result.checkLinkedin : false
    }
    for (const [storageVar, checkBoxId] of Object.entries(checkPairs)) {
        let checkBox = document.getElementById(checkBoxId);
        if (!checkBox) {
            console.log(`Couldn't find a checkbox with id '${checkBoxId}'`)
            continue
        }

        checkBox.checked = result[storageVar] ? result[storageVar] : false
        checkBox.addEventListener("change", () => {
            checkValues[storageVar] = checkBox.checked
            changed = true
        })
    }

    let audioSelector = document.getElementById("audio-alert")
    let selectedAudioUrl = result.warnAudio ? result.warnAudio : ""
    for (const [i18nKey, audioUrl] of Object.entries(audio)) {
        let option = document.createElement("option")
        option.value = audioUrl
        option.innerText = chrome.i18n.getMessage(i18nKey)

        if (audioUrl === selectedAudioUrl) {
            option.selected = true
        }

        audioSelector.appendChild(option)
    }

    audioSelector.valueToSelect = result.warnAudio ? result.warnAudio : ""
    audioSelector.addEventListener("change", () => {
        if (audioSelector.value) {
            let audioElement = document.createElement("audio")
            audioElement.src = audioSelector.value
            audioElement.play().catch(err => console.log(`Failed to play audio: ${err}`))
            selectedAudioUrl = audioSelector.value
        }

        changed = true
    })

    let input = document.getElementById("bad-words-input")
    input.setAttribute("placeholder", chrome.i18n.getMessage("add_a_bad_word_placeholder"))
    let wordBox = document.getElementById("saved-bad-words")
    const badWords = result.badWords ? result.badWords : []
    badWords.forEach(word => {
        let span = buildWordSpan(word)
        wordBox.insertBefore(span, input)
    })

    input.addEventListener("focusout", function () {
        saveInput()
    })

    input.addEventListener("keyup", function (ev) {
        if (ev.defaultPrevented) {
            return
        }

        switch (ev.key) {
            case "Enter": {
                saveInput()
            }
        }

        ev.preventDefault()
    })

    let searchBox = document.getElementById("bad-words-search-input")
    searchBox.addEventListener("input", () => {
        let searchRegex;
        if (searchBox.value) {
            searchRegex = new RegExp(`^\\w*${searchBox.value}\\w*$`);
        } else {
            searchRegex = /.*/
        }

        wordBox.childNodes.forEach(word => {
            if (word.nodeName === "INPUT") {
                return
            }

            if (!searchBox.value) {
                word.style.borderStyle = "hidden"
                return
            }

            if (searchRegex.test(word.childNodes[0].textContent)) {
                word.style.borderColor = warnColor
                word.style.borderStyle = "solid"
                word.style.borderWidth = "5px"
            } else {
                word.style.borderStyle = "hidden"
            }
        })
    })

    function save() {
        if (changed) {
            let config = {
                warnColor: colorPicker.color.hexString,
                badWords: sortUnique(badWords),
                warnAudio: selectedAudioUrl,
                checkTwitter: checkValues.checkTwitter,
                checkFacebook: checkValues.checkFacebook,
                checkLinkedin: checkValues.checkLinkedin,
                checkInstagram: checkValues.checkInstagram
            };
            chrome.storage.sync.set(config)
            changed = false
        }
    }

    const regexp = new RegExp('\\P{Letter}', 'iug')
    function saveInput() {
        let txt = input.value.replace(regexp, '');
        if (txt) {
            let span = buildWordSpan(txt);
            wordBox.insertBefore(span, input)
            badWords.push(txt)
            changed = true
        }
        input.value = "";
    }

    function addCloseListener(closer) {
        closer.addEventListener("click", () => {
            let parentElement = closer.parentElement;
            let word = parentElement.childNodes[0].data;
            parentElement.remove()

            let idx = badWords.indexOf(word);
            if (idx > -1) {
                badWords.splice(idx, 1);
            }
            changed = true
        })
    }

    function buildWordSpan(txt) {
        let span = document.createElement("span")
        span.innerText = txt
        span.style.borderRadius = "3px"
        span.style.fontSize = "24px";
        span.style.verticalAlign = "center"
        span.classList.add("bad-word")

        let closeSpan = document.createElement("span")
        closeSpan.innerHTML = "&times;"
        closeSpan.classList.add("closer")
        closeSpan.style.marginLeft = "5px"
        closeSpan.style.marginRight = "-5px"
        closeSpan.style.fontSize = "24px";
        closeSpan.style.fontStyle = "bold"
        closeSpan.style.verticalAlign = "center"
        addCloseListener(closeSpan)
        span.appendChild(closeSpan)
        return span;
    }

    setInterval(save, 3000)

    window.addEventListener("beforeunload", () => {
        save()
    })
})


function sortUnique(arr) {
    if (arr.length === 0) return arr;
    arr = arr.sort((a, b) => a * 1 - b * 1)

    let ret = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }

    return ret;
}
