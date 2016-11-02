const alphaNode = document.getElementById('note-text');
const container = document.getElementById('note-container');
let notesArray = [];

storageIsAvailable() && initDB();

alphaNode.addEventListener('keypress', event => {
    if (event.which === 13) {
        event.preventDefault();
        alphaNode.blur();
        createNewNote(alphaNode);
    }
});

function renderNote(note) {
    let bodyDiv = document.createElement('div');
    let tagsDiv = document.createElement('div');
    tagsDiv.className = "todo-tag-list";
    bodyDiv.id = note.id;
    bodyDiv.innerHTML = note.body;
    tagsDiv.innerHTML = note.tags;
    container.appendChild(bodyDiv);
    container.appendChild(tagsDiv);
}

function createNewNote(node) {

    let body = node.innerHTML
        .replace(/&nbsp;/, " ")
        .split(" ");
    let note = new Note(body);

    renderNote(note);

    return storageIsAvailable() ? localStorage.setItem(JSON.stringify(note.id), JSON.stringify(note)) : notesArray.push(note);

}

function initDB() {
    for (let item in localStorage) {
        let note = JSON.parse(localStorage[item])
        if (note.body && note.id) {
            renderNote(note);
        }
    }
}

function storageIsAvailable() {

    try {
        localStorage.setItem("null", "null");
        localStorage.removeItem("null", "null");
        return true;
    } catch (error) {
        return false;
    }

}


class Note {

    constructor(body) {
        this.body = this.parseBody(body);
        this.tags = this.parseTags(body);
        this.id = Note.generateUId();
    }

    static generateUId() {
        let sub = () =>
            Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        return sub() + sub() + "-" + sub() + "-" + sub() + "-" + sub() + "-" + sub() + sub() + sub();
    }

    parseTags(body) {
        return body.filter(element => element.charAt(0) === "#");
    }

    parseBody(body) {
        return body.map(element => element.charAt(0) === "#" ?
            element = "<span>" + element + "</span>" :
            element).join(" ");
    }

}