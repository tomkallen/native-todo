const inputField = document.getElementById('note-text');
const container = document.getElementById('note-container');

let pristine = true;
// checks whether 'input field'' was clicked
let notesArray = [];
// notesArray is the fallback for localstorage DB

storageIsAvailable() && initDB();
// Initializing and rendering the localstorage database
// only if it is available:

inputField.addEventListener('keypress', event => {
    // On Enter parse and store the note

    if (event.which === 13) {
        event.preventDefault();
        inputField.blur();
        createNewNote(inputField);
    }

});

document.addEventListener('click', e => {

    ofClass(e.target, 'button-delete') && e.target.parentElement.remove();
    if (ofClass(e.target, 'input-field')) {
        pristine = false;
        document.getElementsByClassName('blinking-cursor')[0].remove();
        e.target.innerHTML = '';
    }

});

function ofClass(_element, _class) {
    return _element.className.split(" ").includes(_class);
}


function render(note) {

    let [panel, bodyDiv, tagsDiv] = [
        node('div', 'panel panel-default'),
        node('div'),
        node('div', 'todo-tag-list')
    ];
    let { body, tags, id } = note;
    [bodyDiv.id, bodyDiv.innerHTML, tagsDiv.innerHTML] = [id, body, tags];
    panel.appendChild(bodyDiv);
    panel.appendChild(tagsDiv);
    container.appendChild(panel);


}

function createNewNote(node) {

    let body = node.innerHTML
        .replace(/&nbsp;/g, " ") // get rid of nonbreakings
        .split(" ");
    let note = new Note(body);
    render(note);
    return storageIsAvailable() ? localStorage.setItem(JSON.stringify(note.id), JSON.stringify(note)) : notesArray.push(note);

}

function node(element = 'div', _class, _html) {

    let node = document.createElement(element);
    if (_class) node.className += " " + _class;
    if (_html) node.innerHTML = _html
    return node;

}

function initDB() {

    for (let item in localStorage) {
        let note = JSON.parse(localStorage[item])
        note.body && render(note);
    }

}

function storageIsAvailable() {
    // Checking availability of local storgae for the user

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
        return "a" + sub().slice(1) + sub() + "-" + sub() + "-" + sub() + "-" + sub() + "-" + sub() + sub() + sub();
    }

    parseTags(body) {
        let newSpan = node("span", "button-delete", "x");
        let parentStub = node();
        parentStub.appendChild(newSpan);
        let spanHtml = parentStub.innerHTML;
        parentStub.remove();
        return body
            .filter(element => element.charAt(0) === "#")
            .map(e => e = "<li>" + e.slice(1) + spanHtml + "</li>")
            .join(" ");
    }

    parseBody(body) {
        return body.map(element => element.charAt(0) === "#" ?
            element = '<span class="tag">' + element + '</span>' :
            element).join(" ");
    }

}