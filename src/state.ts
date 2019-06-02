import * as vscode from "vscode";
import { commandMap, Command }from "./commands/base";
import { TextDecoder } from "util";

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
             return  this._editor.selection;
         }
         return;
     }

     get pos(): vscode.Position {
         if (this._editor) {
             return this._editor.selection.active;
         }
         return new vscode.Position(0, 0);
     }

     public text(range: vscode.Range): string {
         if(this.doc) {
            return this.doc.getText(range);
         }
         return '';
     }

     public setPos(anchor: vscode.Position, active: vscode.Position) {
        if (this._editor) {
            this._editor.selection = new vscode.Selection(anchor, active);
        }
     }


 }



 class Ring {
    protected _data: string[];
    protected _curPos: number;
    protected _capability: number;

    constructor(ringSize: number) {
        this._data = [];
        this._curPos = 0;
        this._capability = ringSize;
    }

    public push(str: string) {
        if (str === '') {
            return;
        }

        if (this._data.length >= this._capability) {
            this._data.shift();
        }
        this._data.push(str);
        this._curPos = this._data.length - 1;
    }

    public rolling() {
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

    public back() {
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

 class KillRing extends Ring {
    constructor(ringSize: number) {
        super(ringSize);
    }

    public extendsBack(str: string) {
        if (this._data.length === 0) {
            this._data.push(str);
            return;
        }
        let s = this._data.pop();
        this._data.push(s + str);
    }
 }



 class CommandContainer {
     private _list: string[];
     private _repeat: boolean;


     constructor() {
         this._list = [];
         this._repeat = false;
     }

     public push(command: string): Command | undefined {
         if (command === 'C-g') {
             this._list = [];
             emacs.updateStatusBar("Quit");
             return;
         } else if (this._list.length ===0 && command.length === 1) {
             if (command == 'z' && this._repeat) {
                this.clear();
                return commandMap['C-x z'].command;
             }
         }
         this._list.push(command);
         let name = this._list.join(' ');
         let c = commandMap[name];
         if (c && !c.command.prefix) {
            if (c.command.name === 'C-x z') {
                this._repeat = true;
            } else {
                this._repeat = false;
            }
            this.clear();
            return c.command;
         }

         emacs.updateStatusBar(name + '-');
         return;
     }

     public clear() {
         this._list = [];
         emacs.updateStatusBar('');
     }
 }

/**
 * emacs state
 */
class Emacs {
    private _mark: boolean;
    private _anchor: vscode.Position;
    private _editor: Editor;
    private _killRing: KillRing;
    private _yankRange: vscode.Range;  // for M-y
    // TODO
    private _markRing: Ring;
    // command history
    private _commandRing: Ring;

    // command container
    private _commandContainer: CommandContainer;

    // status bar
    private _statusItem: vscode.StatusBarItem;


    constructor() {
        this._mark = false;
        this._anchor = new vscode.Position(0, 0);
        this._editor = new Editor();
        this._killRing = new KillRing(20);
        this._yankRange = new vscode.Range(0, 0, 0, 0);
        this._markRing = new Ring(20);
        this._commandRing = new Ring(20);
        this._commandContainer = new CommandContainer();
        this._statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    }

    get mark() {
        return this._mark;
    }

    set mark(m: boolean) {
        if (m) {
            this._mark = true;
            this.updateStatusBar('Mark set');
        } else {
            this._mark = false;
            this.updateStatusBar('Mark deactivated');
        }
    }

    get editor() {
        return this._editor;
    }

    get killRing() {
        return this._killRing;
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
        if (c) {
            c.run();
            this.traceCommand(c);
            return true;
        }
        this.mark = false;
        return false;
    }

    public traceCommand(command: Command): void {
        if (command.trace) {
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
                this.mark = false;
            } else {
                this._anchor = editor.selection.active;
                editor.selection = new vscode.Selection(this._anchor,this._anchor);
                this.mark = true;
            }
        }
    }

    public setCurrentPosition(pos: vscode.Position): void {
        if (this._mark) {
            this._editor.setPos(this._anchor, pos);
        } else {
            this._editor.setPos(pos, pos);
        }
    }

}

export let emacs = new Emacs();