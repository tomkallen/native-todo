const alphaNode = document.getElementById('note-text');
const container = document.getElementById('note-container');
const deleteButtonList = document.getElementsByClassName('button-delete');

let notesArray = [];
// notesArray is the fallback for localstorage DB

storageIsAvailable() && initDB();
// Initializing and rendering the localstorage database
// only if it is available:

alphaNode.addEventListener('keypress', event => {
    // On Enter parse and store the note

    if (event.which === 13) {
        event.preventDefault();
        alphaNode.blur();
        createNewNote(alphaNode);
    }

});

document.addEventListener('click', function(e) {
    if (ofClass(e.target, 'button-delete')) {
        e.target.parentElement.remove();
    }
});

function ofClass(_element, _class) {
    return _element.className.split(" ").indexOf(_class) !== -1;
}


function render(note) {

    let [bodyDiv, tagsDiv] = [node('div'), node('ul')];
    let { body, tags, id } = note;
    [bodyDiv.id, bodyDiv.innerHTML, tagsDiv.innerHTML] = [id, body, tags];
    container.appendChild(bodyDiv);
    tagsDiv.className = "todo-tag-list";
    container.appendChild(tagsDiv);

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
    if (_class) node.className = _class;
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
        let newSpan = node("span", "button-delete", "x");
        let _ = node("div");
        _.appendChild(newSpan);
        let spanHtml = _.innerHTML;
        _.remove();
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