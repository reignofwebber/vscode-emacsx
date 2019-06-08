import * as vscode from "vscode";
import { keyMap, Mode, Command, ICommand, CommandState } from "./commands/base";
import { TextDecoder } from "util";
import { runNativeCommand } from "./runner";
import { repeatInitNumber } from "./configure";

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



class CommandContainer {
    private _list: string[];
    private _repeat: boolean;

    private _curArg: number;

    constructor() {
        this._list = [];
        this._repeat = false;
        this._curArg = 0;
    }

    public push(command: string): ICommand {
        if (command === 'C-g') {
            this._list = [];
            this._repeat = false;
            return {
                state: CommandState.Well,
                command: keyMap[emacs.mode]['C-g'].command
            };
            // command buffer is empty and command === z and last command is C-x z            
        } else if (this._list.length === 0 && command.length === 1) {
            if (command === 'z' && this._repeat) {
                this.clear();
                return {
                    state: CommandState.Well,
                    command: keyMap[emacs.mode]['C-x z'].command
                };
            } else {
                return {
                    state: CommandState.UnDefined,
                };
            }
        } else if (this._list.length && this._list[0] === 'C-u') {
            let n = Number.parseInt(command);
            // argument is over or C-u triggered.
            if (isNaN(n)) {
                if (command === 'C-u') {
                    // no number input
                    if (this._curArg === 0) {
                        this._list.push(command);
                        let s = this._list.join(' ');
                        emacs.updateStatusBar(s + '-');
                        return {
                            state: CommandState.InCompete
                        };
                    }
                }
            } else {
                // ensure list has only one 'C-u' prefix
                let i = 0;
                for (; i < this._list.length; i++) {
                    const c = this._list[i];
                    if (c !== 'C-u') {
                        break;
                    }
                }
                this._list = this._list.slice(i - 1);
                this._curArg *= 10;
                this._curArg += n;
                emacs.updateStatusBar('C-u ' + this._curArg.toString() + '-');
                return {
                    state: CommandState.InCompete
                };
            }
        }

        // push command to list
        this._list.push(command);
        // find command strip 'C-u'
        let i = 0;
        for (; i < this._list.length; i++) {
            const c = this._list[i];
            if (c !== 'C-u') {
                break;
            }
        }
        let cuName = '';
        let name = this._list.slice(i).join(' ');
        if (i > 0) {
            if (this._curArg) {
                cuName = 'C-u ' + this._curArg.toString() + ' ';
            } else {
                cuName = this._list.slice(0, i).join(' ') + ' ';
            }

        }

        let c = keyMap[emacs.mode][name];
        // do not return a prefix command
        if (c && !c.command!.prefix) {
            if (c.command!.name === 'C-x z') {
                this._repeat = true;
            } else {
                this._repeat = false;
            }
            // run with repeat
            let repeat = 0;
            if (i > 0) {
                repeat = this._curArg ? this._curArg : i;
            }
            // clear list and _curArg
            this.clear();
            return {
                state: CommandState.Well,
                repeat: {
                    num: repeat,
                    repeatByNumber: this._curArg ? true : false
                },
                command: c.command
            };
        } else if (i && name.length === 1) {
            let curArg = this._curArg;
            this.clear();
            return {
                state: CommandState.Well,
                command: new class extends Command {
                    trace = false;
                    public run() {
                        let repeat = 1;
                        if (i > 0) {
                            repeat = curArg ? curArg : repeatInitNumber ** i;
                        }
                        for (let i = 0; i < repeat; ++i) {
                            runNativeCommand('default:type', {
                                text: name
                            });
                        }
                    }
                }
            };
            // c is undefined;
        } else if (!c) {
            // not found in command map, confirm if is some commands' prefix.
            let isPrefix = false;
            for (let k in keyMap[emacs.mode]) {
                if (k.indexOf(name) === 0) {
                    isPrefix = true;
                    break;
                }
            }
            if (!isPrefix) {
                this._list = [];
                this._repeat = false;
                emacs.updateStatusBar(`${name} is undefined`);
                return {
                    state: CommandState.UnDefined,
                };
            }
            // trigger C-u `letter`
        }

        emacs.updateStatusBar(cuName + name + '-');
        return {
            state: CommandState.InCompete,
        };
    }

    public clear() {
        this._list = [];
        this._curArg = 0;
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
    private _mode: Mode;
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
    private _commandRing: Ring<string>;

    // command container
    private _commandContainer: CommandContainer;

    // status bar
    private _statusItem: vscode.StatusBarItem;


    constructor() {
        this._mode = Mode.Global;
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
    }

    set mode(m: Mode) {
        this._mode = m;
    }

    get mode() {
        return this._mode;
    }

    get mark() {
        return this._mark;
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


    public updateStatusBar(str: string) {
        this._statusItem.text = str;
        this._statusItem.show();
    }

    public type(char: string): boolean {
        let c = this.command.push(char);
        if (c.state === CommandState.Well) {
            c.command!.run();
            this.traceCommand(c.command);
            return true;
        } else if (c.state === CommandState.InCompete) {
            return true;
        } else {
            if (this._mark) {
                this.setMark(false);
                this.setCurrentPosition();
            }
            return false;
        }
    }

    public traceCommand(command: Command | undefined): void {
        if (command && command.trace) {
            this._commandRing.push(command.name);
        }
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