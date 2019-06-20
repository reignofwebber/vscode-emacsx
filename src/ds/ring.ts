

export class Ring<T> {
    protected _data: T[];
    protected _curPos: number;
    protected _capability: number;

    constructor(ringSize: number) {
        this._data = [];
        this._curPos = 0;
        this._capability = ringSize;
    }

    public push(t: T) {
        if (this._data.length >= this._capability) {
            this._data.shift();
        }
        this._data.push(t);
        this._curPos = this._data.length;
    }

    // TODO rolling number
    public rolling(num: number = 1): T | null {
        if (this._data.length === 0) {
            return null;
        }
        if (this._curPos === 0) {
            this._curPos = this._data.length - 1;
        } else {
            --this._curPos;
        }
        return this._data[this._curPos];
    }

    public resetCursor() {
        this._curPos = this._data.length - 1;
    }

    public back(): T | null {
        if (this._data.length === 0) {
            return null;
        }
        return this._data[this._data.length - 1];
    }

    public clear() {
        this._data = [];
        this._curPos = 0;
    }

}

export class KillRing extends Ring<string> {
    constructor(ringSize: number) {
        super(ringSize);
    }

    public extendsBack(str: string, positive: boolean = true) {
        if (this._data.length === 0) {
            this._data.push(str);
            return;
        }
        let s = this._data.pop();
        this._data.push(positive ? s + str : str + s);
    }
}


/**
 * rectangle ring
 *
 */
export class RectangleText {
    private _buf: string[];
    private _width: number;
    constructor(s: string) {
        this._buf = s.split('\n');
        this._width = 0;
        for (const s of this._buf) {
            if (this._width < s.length) {
                this._width = s.length;
            }
        }
    }

    get height() {
        return this._buf.length;
    }

    get width() {
        return this._width;
    }

    *[Symbol.iterator]() {
        for (const s of this._buf) {
            yield s;
        }
    }

}
