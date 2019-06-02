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
    private _data: string[];
    private _curPos: number;
    private _capability: number;

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
        let res = this._data[this._curPos];
        if (this._curPos === 0) {
            this._curPos = this._data.length - 1;
        } else {
            --this._curPos;
        }
        return res;
    }

    public clear() {
        this._data = [];
        this._curPos = 0;
    }

 }

 class CommandContainer {
     private _list: string[];
     constructor() {
         this._list = [];
     }

     public push(command: string): Command | undefined {
         if (command === 'C-g') {
             this._list = [];
             emacs.updateStatusBar("Quit");
             return;
         }
         this._list.push(command);
         let name = this._list.join(' ');
         for (let n in commandMap) {
             if (name === n) {
                this._list = [];
                let c = commandMap[name];
                return c.command;
             }
         }

         emacs.updateStatusBar(command + ' ');
         return;
     }
 }

/**
 * emacs state
 */
class Emacs {
    private _mark: boolean;
    private _anchor: vscode.Position;
    private _editor: Editor;
    private _killRing: Ring;
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
        this._killRing = new Ring(20);
        this._markRing = new Ring(20);
        this._commandRing = new Ring(20);
        this._commandContainer = new CommandContainer();
        this._statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    }

    get isMark() {
        return this._mark;
    }

    get editor() {
        return this._editor;
    }

    get killRing() {
        return this._killRing;
    }

    get command() {
        return this._commandContainer;
    }


    public updateStatusBar(str: string) {
        this._statusItem.text = str;
        this._statusItem.show();
    }

    // TODO
    public type(char: string): boolean {
        return false;
    }

    // TODO
    public traceCommand(command: string): void {

    }

    public toggleMark(): void {
        // in mark mode
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            if (this._mark === true && this._anchor === editor.selection.active) {
                this._mark = false;
            } else {
                this._anchor = editor.selection.active;
                editor.selection = new vscode.Selection(this._anchor,this._anchor);
                this._mark = true;
            }
        }
    }

    // TODO
    public emitCommand(): void {

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