import * as vscode from "vscode";
import { Command, ICommand, keyMap } from "./cmd_base";
import { killRingSize, markRingSize } from "./configure";
import { KillRing, RectangleText, Ring } from "./ds/ring";
import { Editor } from "./editor";
import { Mode } from "./global";
import _ = require("lodash");


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
        this._killRing = new KillRing(killRingSize);
        this._rectangleRing = new Ring(killRingSize);
        this._yankRange = new vscode.Range(0, 0, 0, 0);
        this._markRing = new Ring(markRingSize);
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
        let text = this._statusItem.text || '';
        if (joinCommand) {
            if (text.indexOf('-') !== -1) {
                text = text.replace(/-$/, ` ${str}-`);
            } else {
                text = str + '-';
            }
        } else {
            text = str;
        }

        if (text.indexOf('emacs: ') === -1) {
            this._statusItem.text = 'emacs: ' + text;
        } else {
            this._statusItem.text = text;
        }
        this._statusItem.show();
    }

    public appendStatus(str: string) {
        this._statusItem.text = this._statusItem.text + ' ' + str;
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
    public async push(command: string, run: boolean = true): Promise<"undefined" | "incomplete" | ICommand> {
        // if last command is active
        // FIXME? " `push`return false, _curCommand must be inActive"
        if (this._curCommand.isActive && await this._curCommand.push(command)) {
            return "incomplete";
        }
        // quit active
        if ('C-g' === command) {
            if (run) {
                await this.c_quit.active();
            }
            return {
                command: this.c_quit
            };
        }
        // find command
        this._list.push(command);
        let cName = this._list.join(' ');
        let c = this.getCommand(cName);

        // find a command
        if (c) {
            this.clear();
            if (run) {
                await c.active();
            }
            this._curCommand = c;
            return {
                command: c
            };
        // type active
        } else if (this.isText(cName)) {
            this.clear();
            if (run) {
                await this.c_type.active(cName);
            }
            return {
                command: this.c_type,
                arg: cName
            };
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
    // FIXME?
    private isText(key: string): boolean {
        if (!/(C-|M-|__).*/.exec(key)) {
            return true;
        }
        return false;
    }

    public clear() {
        this._list = [];
        emacs.updateStatusBar('');
    }

    get isEmpty() {
        return this._list.length === 0;
    }

    get isActive() {
        return this._curCommand.isActive;
    }
}



export let emacs = new Emacs();