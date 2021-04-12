let changed = false

let colorPicker = new iro.ColorPicker('#color-picker', {
    width: 320,
    color: "#DD0000"
});
colorPicker.on("color:change", () => {
    changed = true
})

let input = document.getElementById("bad-words-input")
let wordBox = document.getElementById("saved-bad-words")
let badWords = [];
chrome.storage.sync.get(['badWords'], result => {
    badWords = result.badWords ? result.badWords : []
    badWords.forEach(word => {
        let span = buildWordSpan(word)
        wordBox.insertBefore(span, input)
    })
})

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

let regexp = new RegExp('\\P{Letter}', 'iug')
function saveInput() {
    let txt = input.value.replace(regexp, '');
    if (txt) {
        let span = buildWordSpan(txt);
        wordBox.insertBefore(span, input)
        console.log(txt)
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

function save() {
    if (changed) {
        chrome.storage.sync.set({
            warnColor: colorPicker.color.hexString,
            badWords: sortUnique(badWords)
        })
        changed = false
    }
}

setInterval(save, 3000)

window.addEventListener("beforeunload", () => {
    save()
})

