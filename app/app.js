{
    const inputField = document.getElementById('input-basic');
    const container = document.getElementById('note-container');

    let notesArray = [];
    // notesArray is the fallback for localstorage DB

    storageIsAvailable() && initDB();
    // Initializing and rendering the localstorage database
    // only if it is available:

    inputField.addEventListener('keypress', e => {
        // On Enter parse and store the note        

        if (e.which === 13 && e.target.value.length > 2) {
            //prevent empty notes from saving

            e.preventDefault();
            inputField.style.visibility = "collapse";
            createNewNote(inputField);
            inputField.value = "";
        }

    });
    document.addEventListener('keypress', e => {
        if (ofClass(e.target, "card")) {
            if (e.which === 13) {
                e.preventDefault();
                e.target.classList.remove("edit-mode");
                e.target.setAttribute("contenteditable", "false");
                let parent = e.target.parentElement;
                let id = parent.id.toString();
                parent.parentElement.remove();
                editNote(e.target, id);
            }
        }
    })
    document.addEventListener('click', e => {
        // Universal listener for dynamically created elements 

        if (ofClass(e.target, 'button-delete')) {
            // tags - not finished
            e.target.parentElement.remove();
        }

        if (ofClass(e.target, 'add-note')) {
            inputField.style.visibility = "visible";
        }

        if (ofClass(e.target, 'input-field')) {
            e.target.innerHTML = '';
        }

        if (ofClass(e.target, 'remove-todo')) {

            let parent = e.target.parentElement;
            let id = JSON.stringify(parent.id);
            storageIsAvailable() && localStorage.removeItem(id);
            parent.parentElement.style.opacity = "0.2";

            // TODO: add onbeforeunload event?

        }
        if (ofClass(e.target, 'card')) {
            e.target.setAttribute("contenteditable", "true");
            e.target.classList.add("edit-mode");
        };


    });

    function ofClass(_element, _class) {
        // Helper to check for specific class
        return _element.className.split(" ").includes(_class);
    }


    function render(note) {

        // Creating 2 nodes to render them later
        let [panelElement, bodyElement] = [
            node('div', 'col-md-3  col-sm-4 note-body'),
            node('div')
        ];
        // appending Note class data to nodes
        let { body, id } = note;
        [bodyElement.id, bodyElement.innerHTML] = [id, `<div class="remove-todo">done!</div><div class="card">${body}</div>`];
        panelElement.appendChild(bodyElement);
        container.appendChild(panelElement);


    }

    function createNewNote(input) {

        let body = input.value
            .replace(/&nbsp;/g, " ")
            // Getting rid of nonbreakings to make parser's job easier
            .split(" ");
        let note = new Note(body);
        render(note);
        return storageIsAvailable() ?
            localStorage.setItem(JSON.stringify(note.id), JSON.stringify(note)) :
            notesArray.push(note);

    }

    function editNote(input, id) {

        let body = input.innerHTML
            .replace(/&nbsp;/g, " ")
            .replace(/(<span[^>]*>)|(<\/span>)/g, "")
            .replace(/(<font[^>]*>)|(<\/span>)/g, "")
            .split(" ");
        let note = new Note(body, id);
        render(note);
        if (storageIsAvailable() && localStorage.getItem(note.id) !== null) {
            console.log(localStorage.getItem(JSON.parse(note.id)));
            localStorage.removeItem(note.id);
        }
        return storageIsAvailable() ?
            localStorage.setItem(JSON.stringify(note.id), JSON.stringify(note)) :
            notesArray.push(note);
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

        constructor(body, id) {
            this.body = this.parseBody(body);
            this.id = id || Note.generateUId();
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

        parseBody(body) {
            // checks note text and looks for tags, then wraps them in span
            // and styles them with css
            return body.map(element => element.charAt(0) === "#" ?
                element = '<span class="tag">' + element + '</span>' :
                element).join(" ");
        }

    }
}