class User {
    constructor(pseudo, socketId) {
        this._pseudo = pseudo;
        this._socketId = socketId;
    }

    get pseudo() {
        return this._pseudo;
    }

    set pseudo(value) {
        this._pseudo = value;
    }

    get socketId() {
        return this._socketId;
    }

    set socketId(value) {
        this._socketId = value;
    }

    get opponent() {
        return this._opponent;
    }

    set opponent(value) {
        this._opponent = value;
    }

    get ready() {
        return this._ready;
    }

    set ready(value) {
        this._ready = value;
    }

    get number() {
        return this._number;
    }

    set number(value) {
        this._number = value;
    }

    to_string() {
        return "Viewer[pseudo=" + this._pseudo + ", socketId=" + this._socketId + "]";
    }
}

module.exports = User;
