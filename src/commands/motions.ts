import {TextDocument, Position, TextEditor, TextEditorCursorStyle } from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerGlobalCommand, Command, RepeatType } from "./base";
import * as logic from "./logichelper";
import _ = require("lodash");


export function active() {

}


class MotionCommand extends Command {
    public run(): void {
        let doc = emacs.editor.doc;
        if (doc) {
            let pos = emacs.editor.pos;
            let tar = this.motionRun(doc, pos);
            if (tar) {
                emacs.setCurrentPosition(tar, true);
            }
        }
    }

    public motionRun(doc: TextDocument, pos: Position) : Position | undefined {
        return;
    }
}

class MotionExtCommand extends Command {
    public run(): void {
        let editor = emacs.editor.ed;
        if (editor) {
            let tar = this.motionRun(editor);
            if (tar) {
                emacs.setCurrentPosition(tar);
            }
        }
    }

    public motionRun(editor: TextEditor): Position | undefined {
        return new Position(0, 0);
    }
}

@registerGlobalCommand
class Undo extends Command {
    name = "C-/";
    change = true;
    public run(): void {
        runNativeCommand("undo");
    }
}

@registerGlobalCommand
class Redo extends Command {
    name = "C-?";
    change = true;
    public run(): void {
        runNativeCommand("redo");
    }
}


@registerGlobalCommand
class ForwardChar extends Command {
    name = "C-f";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "right",
            by: "character",
            value: 1,
            select: emacs.mark
        });
    }
}

@registerGlobalCommand
class BackwardChar extends Command {
    name = "C-b";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "left",
            by: "character",
            value: 1,
            select: emacs.mark
        });
    }
}

@registerGlobalCommand
class NextLine extends MotionExtCommand {
    name = "C-n";
    public motionRun(editor: TextEditor): undefined {
        runNativeCommand("cursorMove", {
            to: "down",
            by: "character",
            value: 1,
            select: emacs.mark
        });
        let range0 = editor.visibleRanges[0];
        let line = emacs.editor.pos.line;
        if (line !== editor.document.lineCount - 1 &&
            range0.end.line === line + 1) {
            runNativeCommand("revealLine", {
                lineNumber: line,
                at: "center"
            });
        }


        return;
    }
}

@registerGlobalCommand
class PreviousLine extends MotionExtCommand {
    name = "C-p";
    public motionRun(editor: TextEditor): undefined {
        runNativeCommand("cursorMove", {
            to: "up",
            by: "character",
            value: 1,
            select: emacs.mark
        });
        let range0 = editor.visibleRanges[0];
        let line = emacs.editor.pos.line;
        if (line !== 0 &&
            range0.start.line === line) {
            runNativeCommand("revealLine", {
                lineNumber: line,
                at: "center"
            });
        }

        return;
    }
}

@registerGlobalCommand
class ForwardWord extends MotionCommand {
    name = "M-f";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return logic.getForWardWordPos(doc, pos);
    }
}

@registerGlobalCommand
class BackwardWord extends MotionCommand {
    name = "M-b";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return logic.getBackWardWordPos(doc, pos);
    }
}

@registerGlobalCommand
class MoveBeginningOfLine extends MotionCommand {
    name = "C-a";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return new Position(pos.line, 0);
    }
}

@registerGlobalCommand
class MoveEndOfLine extends MotionCommand {
    name = "C-e";
    public motionRun(doc: TextDocument, pos: Position): Position {
        let endChIndex = doc.lineAt(pos.line).text.length;
        return new Position(pos.line, endChIndex);
    }
}

@registerGlobalCommand
class BeginningOfBuffer extends MotionCommand {
    name = "M-<";
    public motionRun(doc: TextDocument, pos: Position): Position {
        runNativeCommand("revealLine", {
            lineNumber: 0,
            at: "top"
        });
        return new Position(0, 0);
    }
}

@registerGlobalCommand
class EndOfBuffer extends MotionCommand {
    name = "M->";
    public motionRun(doc: TextDocument, pos: Position): Position {
        let endLineIndex = doc.lineCount - 1;
        let endChIndex = doc.lineAt(endLineIndex).text.length;
        runNativeCommand("revealLine", {
            lineNumber: endLineIndex,
            at: "bottom"
        });
        return new Position(endLineIndex, endChIndex);
    }
}

// FIXME
@registerGlobalCommand
class MoveToWindowLineTopBottom extends MotionExtCommand {
    name = "M-l";
    private _t: number = 0;
    private _c: number = 0;
    private _b: number = 0;

    private _stack: {
        t: number;
        b: number;
    }[] = [];

    protected curPos: "center" | "top" | "bottom" = "bottom";

    public motionRun(editor: TextEditor): Position | undefined {
        let line = 0;
        let range0 = editor.visibleRanges[0];

        let c = emacs.commandRing.back();
        if (!(c && c.name === this.name)) {
            this.curPos = "bottom";
        }

        if (this.curPos === "bottom") {
            line = (range0.start.line + range0.end.line) / 2;
            this.curPos = "center";
        } else if (this.curPos === "center") {
            line = range0.start.line;
            this.curPos = "top";
        } else {
            line = range0.end.line;
            this.curPos = "bottom";
        }

        this.setTopBottom(editor);
        this.stayActive = true;
        return new Position(line, 0);
    }

    protected setTopBottom(editor: TextEditor) {
        let range0 = editor.visibleRanges[0];

        this._t = range0.start.line;
        this._c = Math.floor((range0.start.line + range0.end.line) / 2);
        this._b = range0.end.line;
    }

    public push(s: string):boolean {
        if (s === 'k') {
            this.curPos = "bottom";
            let record = {
                t: this._t,
                b: this._b
            };

            let last = this._stack[this._stack.length - 1];
            if (!last || !(last.b === record.b && last.t === record.t)) {
                this._stack.push(record);
            }

            this._b = this._c;
            this._c = Math.floor((this._b + this._t) / 2);

            emacs.setCurrentPosition(new Position(this._c, 0));
        } else if (s === 'j') {
            this.curPos = "bottom";
            let record = {
                t: this._t,
                b: this._b
            };

            let last = this._stack[this._stack.length - 1];
            if (!last || !(Math.floor((last.b + last.t) / 2) === Math.floor((record.b + record.t) / 2))) {
                this._stack.push(record);
            }

            this._t = this._c;
            this._c = Math.floor((this._b + this._t) / 2);

            emacs.setCurrentPosition(new Position(this._c, 0));
        } else if (s === 'l') {
            this.curPos = "bottom";
            if (this._stack.length > 0) {
                let last = this._stack.pop();
                // if current pos === last pos, then pop until not equals the current pos
                while (emacs.editor.pos.line === Math.floor((last!.b + last!.t) / 2)) {
                    last = this._stack.pop();
                }

                this._b = last!.b;
                this._t = last!.t;
                this._c = Math.floor((this._b + this._t) / 2);
                emacs.setCurrentPosition(new Position(this._c, 0));
            }

        } else {
            this.stayActive = false;
            return false;
        }
        return true;
    }

    public deactive() {
        this._stack = [];
    }
}

@registerGlobalCommand
class ScrollDownCommand extends MoveToWindowLineTopBottom {
    name = "M-v";
    public motionRun(editor: TextEditor): Position | undefined {
        this.runHelper(editor);
        this.stayActive = true;
        return;
    }

    public async runHelper(editor: TextEditor) {
        let range0 = editor.visibleRanges[0];
        if (range0.start.line === 0) {
            return;
        }
        await runNativeCommand("revealLine", {
            lineNumber: range0.start.line,
            at: "bottom"
        });
        this.setTopBottom(editor);
        emacs.setCurrentPosition(new Position(range0.start.line, 0));
    }
}

// FIXME C-u, C-x z
@registerGlobalCommand
class ScrollUpCommand extends MoveToWindowLineTopBottom {
    name = "C-v";
    public motionRun(editor: TextEditor): Position | undefined {
        this.runHelper(editor);
        this.stayActive = true;
        return;
    }

    public async runHelper(editor: TextEditor) {
        let range0 = editor.visibleRanges[0];
        if (range0.end.line >= editor.document.lineCount - 1) {
            return;
        }
        await runNativeCommand("revealLine", {
            lineNumber: range0.end.line,
            at: "top"
        });
        this.setTopBottom(editor);
        emacs.setCurrentPosition(new Position(range0.end.line, 0));
    }

}

@registerGlobalCommand
class RecenterTopBottom extends MoveToWindowLineTopBottom {
    name = "C-l";

    public motionRun(editor: TextEditor): Position | undefined {
        this.runHelper(editor);
        this.stayActive = true;
        return;
    }

    public async runHelper(editor: TextEditor) {
        let pos = emacs.editor.pos;
        let c = emacs.commandRing.back();
        if (!(c && c.name === 'C-l')) {
            this.curPos = "bottom";
        }
        if (this.curPos === "bottom") {
            this.curPos = "center";
        } else if (this.curPos === "center") {
            this.curPos = "top";
        } else {
            this.curPos = "bottom";
        }
        await runNativeCommand("revealLine", {
            "lineNumber": pos.line,
            "at": this.curPos
        });

        this.setTopBottom(editor);
    }

}

@registerGlobalCommand
class BackToIndentation extends MotionCommand {
    name = 'M-m';
    public motionRun(doc: TextDocument, pos: Position): Position | undefined {
        let c = _.findIndex(doc.lineAt(pos.line).text, c => {
            return ' \t'.indexOf(c) === -1;
        });
        return new Position(pos.line, c === -1 ? 0 : c);
    }
}

@registerGlobalCommand
class GoToLine extends Command {
    name = 'M-g g';
    public run(): void {
        emacs.markRing.push(emacs.editor.pos);
        runNativeCommand('workbench.action.gotoLine');
    }
}

@registerGlobalCommand
class NextError extends Command {
    name = 'M-g n';
    public run(): void {
        emacs.markRing.push(emacs.editor.pos);
        runNativeCommand('editor.action.marker.next');
    }
}

@registerGlobalCommand
class PreviousError extends Command {
    name = 'M-g p';
    public run(): void {
        emacs.markRing.push(emacs.editor.pos);
        runNativeCommand('editor.action.marker.prev');
    }
}

class FakeSearch extends Command {
    protected increase = true;
    repeatType = RepeatType.Reject;
    private posHistory: {
        s: string;
        p: Position;
    }[] = [];
    public run() {
        this.stayActive = true;
        this.posHistory.push({
            s: '',
            p: emacs.editor.pos
        });
        emacs.updateStatusBar(this.increase ? 'FakeIsearch: ' : 'FakeIsearch backward: ');
    }

    public push(s: string): boolean {
        if (/^[\x00-\x7f]$/.exec(s)) {
            let editor = emacs.editor.ed;
            if (!editor) {
                this.stayActive = false;
                return false;
            }

            // enter to esc
            if (s === '\n') {
                this.stayActive = false;
                return true;
            }

            let doc = editor.document;
            let pos = emacs.editor.pos;
            let newPos = this.increase ? this.getNext(doc, pos, s) : this.getPrev(doc, pos, s);
            emacs.setCurrentPosition(newPos, true);
            this.posHistory.push({
                s: s,
                p: newPos
            });
            emacs.updateStatusBar(( this.increase ? 'FakeIsearch: ' : 'FakeIsearch backward: ') + this.getHistoryStr());
            return true;
        } else if (s === '__Del__') {
            // don't pop initial position
            if (this.posHistory.length === 1) {
                return true;
            }
            this.posHistory.pop();
            emacs.updateStatusBar(( this.increase? 'FakeIsearch: ' : 'FakeIsearch backward: ') + this.getHistoryStr());
            if (this.posHistory.length !== 0) {
                emacs.setCurrentPosition(this.posHistory[this.posHistory.length - 1].p, true);
            }
            return true;
        } else {
            this.stayActive = false;
            return false;
        }
    }

    private getHistoryStr() {
        let str = '';
        this.posHistory.forEach(v => {
            str += (' ' + v.s);
        });
        return str;
    }

    private getNext(doc: TextDocument, pos: Position, s: string) {
        let curLine = pos.line;
        let c = pos.character;
        while (curLine <= doc.lineCount - 1) {
            c = _.findIndex(doc.lineAt(curLine).text, c => {
                return c === s;
            }, c + 1);
            if (c !== -1) {
                break;
            }
            c = -1;
            ++curLine;
        }
        return new Position(curLine, c);
    }

    private getPrev(doc: TextDocument, pos: Position, s: string) {
        let curLine = pos.line;
        let c = pos.character;
        while (curLine >= 0) {
            if (c) {
                c = _.findLastIndex(doc.lineAt(curLine).text, c => {
                    return c === s;
                }, c === -1 ? -1 : c - 1);
                if (c !== -1) {
                    break;
                }
            }
            c = -1;
            --curLine;
        }
        return new Position(curLine, c);
    }

    public deactive() {
        this.posHistory = [];
        emacs.updateStatusBar('');
    }

}

@registerGlobalCommand
class FakeIsearchForward extends FakeSearch {
    name = 'M-s';
}

@registerGlobalCommand
class FakeISearchBackWard extends FakeSearch {
    name = 'M-r';
    increase = false;
}


class ISearch extends MotionCommand {
    private readonly _statusMarkSaveHint: string;

    private _statusHint: string;

    private _searchStr: string;
    private _searchStartPos: Position;
    private _curPos: Position;
    protected increase: boolean;

    constructor() {
        super();
        this._statusHint = 'I-search: ';
        this._statusMarkSaveHint = 'Mark saved where search started';

        this._searchStr = '';
        this._searchStartPos = new Position(0, 0);
        this._curPos = new Position(0, 0);
        this.increase = true;
    }

    public motionRun(doc: TextDocument, pos: Position):Position | undefined {
        this.stayActive = true;
        this._curPos = this._searchStartPos = pos;
        this._statusHint = this.increase ? 'I-search: ' : 'I-search backward: ';
        emacs.updateStatusBar(this._statusHint + this._searchStr);
        return;
    }

    public push(s: string): boolean {
        // is char
        if (/^[\x00-\x7f]$/.exec(s)) {
            this._searchStr += s;
            emacs.updateStatusBar(this._statusHint + this._searchStr);
            this.increase ? this.getNext(true) : this.getPrev(true);
            emacs.setCurrentPosition(this._curPos, true);
        } else if (s === '__Del__') {
            this._searchStr = this._searchStr.substr(0, this._searchStr.length - 1);
            emacs.updateStatusBar(this._statusHint + this._searchStr);
            this.increase ? this.getNext(true) : this.getPrev(true);
            emacs.setCurrentPosition(this._curPos, true);
        } else if (s === 'C-s') {
            this.increase = true;
            this._statusHint = 'I-search: ';
            emacs.updateStatusBar(this._statusHint + this._searchStr);
            this.getNext();
            emacs.setCurrentPosition(this._curPos, true);
        } else if (s === 'C-r') {
            this.increase = false;
            this._statusHint = 'I-search backward: ';
            emacs.updateStatusBar(this._statusHint + this._searchStr);
            this.getPrev();
            emacs.setCurrentPosition(this._curPos, true);
        } else {
            if (!(this._searchStartPos.line === emacs.editor.pos.line &&
                this._searchStartPos.character === emacs.editor.pos.character)) {
                emacs.markRing.push(this._searchStartPos);
            }
            this.stayActive = false;
            return false;
        }
        return true;
    }

    private getNext(research: boolean = false) {
        // if searchStr is null, return start pos.
        if (this._searchStr.length === 0) {
            return this._searchStartPos;
        }

        let doc = emacs.editor.doc;
        if (!doc) {
            return this._searchStartPos;
        }
        let nextPos = research ? logic.getNextPos(doc, this._searchStartPos) : logic.getNextPos(doc, this._curPos);
        let curLine = nextPos.line;
        let curC = nextPos.character;
        while (curLine <= doc.lineCount - 1) {
            let str = doc.lineAt(curLine).text.substr(curC);
            let idx = str.indexOf(this._searchStr);
            if (idx !== -1) {
                this._curPos = new Position(curLine, curC + idx);
                return;
            }
            curC = 0;
            ++curLine;
        }
        emacs.updateStatusBar('Failing I-search: ' + this._searchStr);
    }

    private getPrev(research: boolean = false) {
        // if searchStr is null, return start pos.
        if (this._searchStr.length === 0) {
            return this._searchStartPos;
        }

        let doc = emacs.editor.doc;
        if (!doc) {
            return this._searchStartPos;
        }
        let prevPos = research ? logic.getPrevPos(doc, this._searchStartPos) : logic.getPrevPos(doc, this._curPos);
        let curLine = prevPos.line;
        let curC: number | undefined = prevPos.character;
        while (curLine >= 0) {
            let str = doc.lineAt(curLine).text.substr(0, curC);
            let idx = str.indexOf(this._searchStr);
            if (idx !== -1) {
                this._curPos = new Position(curLine, idx);
                return;
            }
            curC = undefined;
            --curLine;
        }
        emacs.updateStatusBar('Failing I-search backward: ' + this._searchStr);
    }

    public deactive() {
        this._searchStartPos = new Position(0, 0);
        this._curPos = new Position(0, 0);
        this._searchStr = '';
    }
}

@registerGlobalCommand
class ISearchForward extends ISearch {
    name = 'C-s';
    public deactive() {
        super.deactive();
        this.increase = true;
    }
}

@registerGlobalCommand
class ISearchBackWard extends ISearch {
    name = 'C-r';
    public deactive() {
        super.deactive();
        this.increase = false;
    }
}