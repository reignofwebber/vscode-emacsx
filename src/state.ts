import * as vscode from "vscode";
import { keyMap, Mode, Command, ICommand } from "./commands/base";
import _ = require("lodash");
import { type } from "os";

/**
 * editor: wrap vscode editor
 */

class Editor {
    private _editor: vscode.TextEditor | undefined;
    constructor() {
        this._editor = vscode.window.activeTextEditor;
        // active editor changed
        vscode.window.onDidChangeActiveTextEditor((textEditor) => {
            // TODO
            this._editor = vscode.window.activeTextEditor;
        });
    }

    get ed(): vscode.TextEditor | undefined {
        return this._editor;
    }

    get doc(): vscode.TextDocument | undefined {
        if (this._editor) {
            return this._editor.document;
        }
        return;
    }

    get sel(): vscode.Selection | undefined {
        if (this._editor) {
            return this._editor.selection;
        }
        return;
    }

    set sel(s: vscode.Selection | undefined) {
        if (this._editor) {
            this._editor.selection = s as vscode.Selection;
        }
    }

    get pos(): vscode.Position {
        if (this._editor) {
            return this._editor.selection.active;
        }
        return new vscode.Position(0, 0);
    }

    public text(range: vscode.Range): string {
        if (this.doc) {
            return this.doc.getText(range);
        }
        return '';
    }

    public setPos(anchor: vscode.Position, active: vscode.Position) {
        if (this._editor) {
            this._editor.selection = new vscode.Selection(anchor, active);
        }
    }

    public revealPos(pos: vscode.Position) {
        if (this._editor) {
            this._editor.revealRange(new vscode.Range(pos, pos));
        }
    }

}



class Ring<T> {
    protected _data: T[];
    protected _curPos: number;
    protected _capability: number;

    constructor(ringSize: number) {
        this._data = [];
        this._curPos = 0;
        this._capability = ringSize;
    }

    public push(t: T) {
        // FIXME
        // if (t === '') {
        //     return;
        // }

        if (this._data.length >= this._capability) {
            this._data.shift();
        }
        this._data.push(t);
        this._curPos = this._data.length - 1;
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

class KillRing extends Ring<string> {
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



export class CommandContainer {
    private _list: string[];

    private _curCommand: Command;

    private readonly c_nothing = keyMap[Mode.Global]['__nothing__'];
    private readonly c_type = keyMap[Mode.Global]['__default:type__'];
    private readonly c_quit = keyMap[Mode.Global]['C-g'];


    constructor() {
        this._list = [];
        this._curCommand = this.c_nothing;
    }

    /**
     * 
     * @param command 
     * @param get get command without active it. 
     */
    public push(command: string, run: boolean = true): "undefined" | "incomplete" | ICommand {
        // if last command is active
        if (this._curCommand.isActive && this._curCommand.push(command)) {
            return "incomplete";
        }
        // quit active
        if ('C-g' === command) {
            if (run) this.c_quit.active();
            return {
                command: this.c_quit
            }
        }        
        // find command
        this._list.push(command);
        let cName = this._list.join(' ');
        let c = this.getCommand(cName);

        // find a command
        if (c) {
            this.clear();
            if (run) c.active();
            this._curCommand = c;
            return {
                command: c
            };
        // type active
        } else if (cName.length === 1) {
            this.clear();            
            if (run) this.c_type.active(cName);
            return {
                command: this.c_type,
                arg: cName
            }
        // command is undefined
        } else if (!this.isPrefix(cName)) {
            this.clear();
            emacs.updateStatusBar(`${cName} is undefined`);
            return "undefined";
        // command is incomplete
        } else {
            emacs.updateStatusBar(command, true);
            return "incomplete";
        }
    }

    private getCommand(key: string): Command | undefined {
        let m: Mode = _.find(emacs.modes, m => {
            return keyMap[m][key];
        }) as Mode;

        return m === undefined ? undefined : keyMap[m][key];
    }

    private isPrefix(key: string): boolean {
        for (let m of emacs.modes) {
            if (_.find(Object.keys(keyMap[m]), s => {
                return s.indexOf(key) === 0;
            })) {
                return true;
            }

        }
        return false;
    }

    public clear() {
        this._list = [];
        emacs.updateStatusBar('');
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

/**
 * emacs state
 */
class Emacs {
    private _modes: Mode[];
    private _mark: boolean;
    private _anchor: vscode.Position;
    private _editor: Editor;
    private _killRing: KillRing;
    // Rectangle kill ring
    private _rectangleRing: Ring<RectangleText>;
    private _yankRange: vscode.Range;  // for M-y
    // TODO per editor, per markRing
    private _markRing: Ring<vscode.Position>;
    // command history
    private _commandRing: Ring<Command>;

    // command container
    private _commandContainer: CommandContainer;

    // status bar
    private _statusItem: vscode.StatusBarItem;
    // readonly 
    private _readonly: boolean;


    constructor() {
        this._modes = [Mode.Global];
        this._mark = false;
        this._anchor = new vscode.Position(0, 0);
        this._editor = new Editor();
        this._killRing = new KillRing(20);
        this._rectangleRing = new Ring(20);
        this._yankRange = new vscode.Range(0, 0, 0, 0);
        this._markRing = new Ring(20);
        this._commandRing = new Ring(20);
        this._commandContainer = new CommandContainer();
        this._statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this._readonly = false;
    }

    public addMode(m: Mode) {
        let i = _.find(this._modes, v => {
            return m === v;
        });
        if (!i) {
            this._modes.push(m);
        }
        this._modes.sort();
    }

    get modes() {
        return this._modes;
    }

    get mark() {
        return this._mark;
    }

    get isReadOnly() {
        return this._readonly;
    }

    set isReadOnly(is: boolean) {
    }
    get markRing() {
        return this._markRing;
    }

    public setMarkPos(pos: vscode.Position) {
        this._mark = true;
        this._markRing.push(pos);
        this._anchor = pos;
        this.updateStatusBar('Mark set');
    }

    public setMark(m: boolean, show: boolean = false) {
        if (m) {
            this._mark = true;
            this._markRing.push(this._editor.pos);
            this.updateStatusBar('Mark set');
        } else {
            this._mark = false;
            if (show) {
                this.updateStatusBar('Mark deactivated');
            }
        }
    }

    get editor() {
        return this._editor;
    }

    get killRing() {
        return this._killRing;
    }

    get rectangleRing() {
        return this._rectangleRing;
    }

    get yankRange() {
        return this._yankRange;
    }

    set yankRange(range: vscode.Range) {
        this._yankRange = range;
    }

    get commandRing() {
        return this._commandRing;
    }

    get command() {
        return this._commandContainer;
    }


    public updateStatusBar(str: string, joinCommand: boolean = false) {
        if (joinCommand) {
            let text = this._statusItem.text || '';
            if (text.indexOf('-') !== -1) {
                text = text.replace(/-$/, ` ${str}-`);
                this._statusItem.text = text;
            } else {
                this._statusItem.text = (str + '-');
            }
        } else {
            this._statusItem.text = str;
        }

        this._statusItem.show();
    }

    public appendStatus(str: string) {
        this._statusItem.text = this._statusItem.text + ' ' + str;
    }

    public type(char: string): boolean {
        // let c = this.command.push(char);
        // if (c.state === CommandState.Well) {
        //     c.command!.active();
        //     this.traceCommand(c.command);
        //     return true;
        // } else if (c.state === CommandState.InCompete) {
        //     return true;
        // } else if (this._readonly) {
        //     return true;
        // } else {
        //     if (this._mark) {
        //         this.setMark(false);
        //         this.setCurrentPosition();
        //     }
        //     return false;
        // }
        return false;
    }

    public traceCommand(command: Command): void {
        this._commandRing.push(command);        
    }

    public toggleMark(): void {
        // in mark mode
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            if (this._mark === true
                && this._anchor.line === this._editor.pos.line
                && this._anchor.character === this._editor.pos.character) {
                this.setMark(false, true);
            } else {
                this._anchor = editor.selection.active;
                editor.selection = new vscode.Selection(this._anchor, this._anchor);
                this.setMark(true);
            }
        }
    }

    public exchangeMark(): void {
        if (this._mark) {
            let active = this._anchor;
            this._anchor = this._editor.pos;
            this._editor.sel = new vscode.Selection(this._anchor, active);
        }
    }

    public setCurrentPosition(pos?: vscode.Position, reveal: boolean = false): void {
        if (!pos) {
            pos = this.editor.pos;
        }
        if (this._mark) {
            this._editor.setPos(this._anchor, pos);
        } else {
            this._editor.setPos(pos, pos);
        }

        if (reveal) {
            this.editor.revealPos(pos);
        }
    }

}

export let emacs = new Emacs();