{
    const inputField = document.getElementById('input-basic');
    const container = document.getElementById('note-container');
    const addNote = document.getElementById('add-note');


    let pristine = true;
    // checks whether 'input field'' was clicked
    let notesArray = [];
    // notesArray is the fallback for localstorage DB

    storageIsAvailable() && initDB();
    // Initializing and rendering the localstorage database
    // only if it is available:

    inputField.addEventListener('keypress', event => {
        // On Enter parse and store the note
        // out of focus == end of edit mode

        if (event.which === 13) {
            event.preventDefault();
            inputField.style.visibility = "collapse";
            createNewNote(inputField);
            inputField.value = "";
        }

    });

    document.addEventListener('click', e => {
        // Universal listener for dynamically created elements 

        if (ofClass(e.target, 'button-delete')) {
            e.target.parentElement.remove();
        }
        if (ofClass(e.target, 'add-note')) {
            inputField.style.visibility = "visible";
        }

        if (ofClass(e.target, 'input-field') && pristine) {
            pristine = false;
            e.target.innerHTML = '';
        }
        if (ofClass(e.target, 'remove-todo')) {
            let parent = e.target.parentElement;
            let id = JSON.stringify(parent.id);
            storageIsAvailable() && localStorage.removeItem(id);
            parent.parentElement.remove()

        }

    });

    function ofClass(_element, _class) {
        // Helper to check for specific class
        return _element.className.split(" ").includes(_class);
    }


    function render(note) {

        // Creating 3 nodes to render them later
        let [panelElement, bodyElement, tagsElement] = [
            node('div', 'col-md-3  col-sm-4 note-body'),
            node('div'),
            node('div', 'todo-tag-list')
        ];
        // appending Note class data to nodes
        let { body, tags, id } = note;
        [bodyElement.id, bodyElement.innerHTML, tagsElement.innerHTML] = [id, '<div class="remove-todo">delete</div>' + body, tags];
        panelElement.appendChild(bodyElement);
        panelElement.appendChild(tagsElement);
        container.appendChild(panelElement);


    }

    function createNewNote(input) {

        let body = input.value
            .replace(/&nbsp;/g, " ")
            // Getting rid of nonbreakings to make parser's job easier
            .split(" ");
        let note = new Note(body);
        render(note);
        return storageIsAvailable() ? localStorage.setItem(JSON.stringify(note.id), JSON.stringify(note)) : notesArray.push(note);

    }

    function node(element = 'div', _class, _html) {
        // Helper, accepts optional parameters:
        // -element type
        // -class name(s)
        // -innerHTML
        // and builds and returns HTML node    

        let node = document.createElement(element);
        if (_class) node.className += " " + _class;
        if (_html) node.innerHTML = _html
        return node;

    }

    function initDB() {
        // Reads from local storage and renders data if it is of type we need

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
            // Genertaes hexademical unique id and prefixes it with an 'a'
            // to satisfy id naming rule.

            let sub = () =>
                // Randomizing hexa 2^16 pieces just to make uid look alright
                Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            return "a" + sub().slice(1) + sub() + "-" + sub() + "-" + sub() + "-" + sub() + "-" + sub() + sub() + sub();
        }

        parseTags(body) {
            // parses note text, generates an array of <li>st items
            // and constructs html to render
            // this is NOT an HTML node

            let newSpan = node("span", "button-delete", "x");
            let parentStub = node();
            parentStub.appendChild(newSpan);
            let spanHtml = parentStub.innerHTML;
            parentStub.remove();
            //parentStub temp node is used to get outerHTML of span

            return body
                .filter(element => element.charAt(0) === "#")
                .map(e => e = "<li>" + e.slice(1) + spanHtml + "</li>")
                .join(" ");
        }

        parseBody(body) {
            // checks note text and looks for tags, then wraps them in span
            // and styles them with css
            return body.map(element => element.charAt(0) === "#" ?
                element = '<span class="tag">' + element + '</span>' :
                element).join(" ");
        }

    }
}