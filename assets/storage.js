export class LocalStorageMap {
    constructor(key) {
        this._key = key;
        this.map = new Map();
        this._load();
    }

    _load() {
        const str = localStorage.getItem(this._key);
        if (str) {
            const obj = JSON.parse(str);
            for (const [key, value] of Object.entries(obj)) {
                this.map.set(key, value);
            }
        }
    }

    get(key) {
        return this.map.get(key);
    }

    set(key, value) {
        this.map.set(key, value);
        this.persist();
    }

    delete(key) {
        this.map.delete(key);
        this.persist();
    }

    persist() {
        const obj = {};
        for (const [key, value] of this.map.entries()) {
            obj[key] = value;
        }
        const str = JSON.stringify(obj);
        localStorage.setItem(this._key, str);
    }
}