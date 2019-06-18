import {TextDocument, Position, TextEditor, TextEditorCursorStyle } from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerGlobalCommand, Command, RepeatType, RepeatableCommand, IRepeat } from "./base";
import * as logic from "./logichelper";
import _ = require("lodash");


export function active() {

}


class MotionCommand extends RepeatableCommand {
    change = false;

    protected editor: TextEditor | undefined;
    protected doc: TextDocument | undefined;
    // Note: store dirty pos
    protected pos: Position = new Position(0, 0);

    public async run(repeat?: IRepeat) {
        this.editor = emacs.editor.ed;
        this.pos = emacs.editor.pos;
        if (this.editor) {
            this.doc = this.editor.document;
        }
        this.repeatNum = repeat ? repeat.repeatByNumber ? repeat.num : 4 ** (repeat.num + 1) : 1;
        await this.runWrapper();
    }

    private async runWrapper() {
        if (this.editor) {
            let tar = await this.motionRun();
            if (tar) {
                emacs.setCurrentPosition(tar, true);
            }
            // store pos for repeat use
            this.pos = emacs.editor.pos;
        }
    }

    public async repeatRun() {
        this.runWrapper();
    }

    public async motionRun() : Promise<Position | void> {
    }
}

@registerGlobalCommand
class Undo extends Command {
    name = "C-/";
    change = true;
    public async run() {
        runNativeCommand("undo");
    }
}

@registerGlobalCommand
class Redo extends Command {
    name = "C-?";
    change = true;
    public async run() {
        runNativeCommand("redo");
    }
}


@registerGlobalCommand
class ForwardChar extends MotionCommand {
    name = "C-f";
    public async motionRun() {
        emacs.setCurrentPosition(logic.getNextByNum(this.doc!, this.pos, this.repeatNum));
    }
}

@registerGlobalCommand
class BackwardChar extends MotionCommand {
    name = "C-b";
    public async motionRun() {
        emacs.setCurrentPosition(logic.getPrevByNum(this.doc!, this.pos, this.repeatNum));
    }
}

let baseColumn = 0;

class LineUpDown extends MotionCommand {
    public async motionRun() {
        let c = emacs.commandRing.back();
        if (!(c && (c.name === 'C-n' || c.name === 'C-p'))) {
            baseColumn = this.pos.character;
        }
    }

    protected reveal() {
        let range0 = this.editor!.visibleRanges[0];
        let line = this.pos.line;
        if (line !== this.doc!.lineCount - 1 &&
            range0.end.line === line + 1) {
            runNativeCommand("revealLine", {
                lineNumber: line,
                at: "center"
            });
        }
        if (line !== 0 &&
            range0.start.line === line) {
            runNativeCommand("revealLine", {
                lineNumber: line,
                at: "center"
            });
        }
    }

}

@registerGlobalCommand
class NextLine extends LineUpDown {
    name = "C-n";
    public async motionRun() {
        super.motionRun();
        emacs.setCurrentPosition(logic.getNextByLine(this.doc!, this.pos, baseColumn, this.repeatNum));
        this.reveal();
    }
}

@registerGlobalCommand
class PreviousLine extends LineUpDown {
    name = "C-p";
    public async motionRun() {
        super.motionRun();
        emacs.setCurrentPosition(logic.getPrevByLine(this.doc!, this.pos, baseColumn, this.repeatNum));
        this.reveal();
    }
}

@registerGlobalCommand
class ForwardWord extends MotionCommand {
    name = "M-f";
    public async motionRun(): Promise<Position> {
        let pos = this.pos;
        for (let i = 0; i < this.repeatNum; ++i) {
            pos = logic.getForWardWordPos(this.doc!, pos);
        }
        return pos;
    }
}

@registerGlobalCommand
class BackwardWord extends MotionCommand {
    name = "M-b";
    public async motionRun(): Promise<Position> {
        let pos = this.pos;
        for (let i = 0; i < this.repeatNum; ++i) {
            pos = logic.getBackWardWordPos(this.doc!, pos);
        }
        return pos;
    }
}

@registerGlobalCommand
class MoveBeginningOfLine extends MotionCommand {
    name = "C-a";
    public async motionRun(): Promise<Position> {
        return new Position(this.pos.line, 0);
    }
}

@registerGlobalCommand
class MoveEndOfLine extends MotionCommand {
    name = "C-e";
    public async motionRun(): Promise<Position> {
        let endChIndex = this.doc!.lineAt(this.pos.line).text.length;
        return new Position(this.pos.line, endChIndex);
    }
}

@registerGlobalCommand
class BeginningOfBuffer extends MotionCommand {
    name = "M-<";
    public async motionRun(): Promise<Position> {
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
    public async motionRun(): Promise<Position> {
        let endLineIndex = this.doc!.lineCount - 1;
        let endChIndex = this.doc!.lineAt(endLineIndex).text.length;
        runNativeCommand("revealLine", {
            lineNumber: endLineIndex,
            at: "bottom"
        });
        return new Position(endLineIndex, endChIndex);
    }
}

// FIXME
@registerGlobalCommand
class MoveToWindowLineTopBottom extends MotionCommand {
    name = "M-l";
    private _t: number = 0;
    private _c: number = 0;
    private _b: number = 0;

    private _stack: {
        t: number;
        b: number;
    }[] = [];

    protected curPos: "center" | "top" | "bottom" = "bottom";

    public async motionRun(): Promise<Position | void> {
        let line = 0;
        let range0 = this.editor!.visibleRanges[0];

        let c = emacs.commandRing.back();
        if (!(c && c.name === this.name)) {
            this.curPos = "bottom";
        }

        if (this.curPos === "bottom") {
            line = Math.floor((range0.start.line + range0.end.line) / 2);
            this.curPos = "center";
        } else if (this.curPos === "center") {
            line = range0.start.line;
            this.curPos = "top";
        } else {
            line = range0.end.line;
            this.curPos = "bottom";
        }

        this.setTopBottom(this.editor!);
        this.stayActive = true;
        return new Position(line, 0);
    }

    protected setTopBottom(editor: TextEditor) {
        let range0 = editor.visibleRanges[0];

        this._t = range0.start.line;
        this._c = Math.floor((range0.start.line + range0.end.line) / 2);
        this._b = range0.end.line;
    }

    public async push(s: string):Promise<boolean> {
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

// TODO C-u, C-x z
@registerGlobalCommand
class ScrollDownCommand extends MoveToWindowLineTopBottom {
    name = "M-v";
    public async motionRun(): Promise<Position | void> {
        this.runHelper(this.editor!);
        this.stayActive = true;
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

// TOD0 C-u, C-x z
@registerGlobalCommand
class ScrollUpCommand extends MoveToWindowLineTopBottom {
    name = "C-v";
    public async motionRun(): Promise<Position | void> {
        this.runHelper(this.editor!);
        this.stayActive = true;
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

    public async motionRun(): Promise<Position | void> {
        this.runHelper(this.editor!);
        this.stayActive = true;
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
    public async motionRun(): Promise<Position | void> {
        let c = _.findIndex(this.doc!.lineAt(this.pos.line).text, c => {
            return ' \t'.indexOf(c) === -1;
        });
        return new Position(this.pos.line, c === -1 ? 0 : c);
    }
}

@registerGlobalCommand
class GoToLine extends Command {
    name = 'M-g g';
    public async run() {
        emacs.markRing.push(emacs.editor.pos);
        runNativeCommand('workbench.action.gotoLine');
    }
}

@registerGlobalCommand
class NextError extends Command {
    name = 'M-g n';
    public async run() {
        emacs.markRing.push(emacs.editor.pos);
        runNativeCommand('editor.action.marker.next');
    }
}

@registerGlobalCommand
class PreviousError extends Command {
    name = 'M-g p';
    public async run() {
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
    public async run() {
        this.stayActive = true;
        this.posHistory.push({
            s: '',
            p: emacs.editor.pos
        });
        emacs.updateStatusBar(this.increase ? 'FakeIsearch: ' : 'FakeIsearch backward: ');
    }

    public async push(s: string): Promise<boolean> {
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

    public async motionRun(): Promise<Position | void> {
        this.stayActive = true;
        this._curPos = this._searchStartPos = this.pos;
        this._statusHint = this.increase ? 'I-search: ' : 'I-search backward: ';
        emacs.updateStatusBar(this._statusHint + this._searchStr);
    }

    public async push(s: string): Promise<boolean> {
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
        let nextPos = research ? logic.getNextByNum(doc, this._searchStartPos) : logic.getNextByNum(doc, this._curPos);
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
        let prevPos = research ? logic.getPrevByNum(doc, this._searchStartPos) : logic.getPrevByNum(doc, this._curPos);
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