import {TextDocument, Position, TextEditor, TextEditorCursorStyle} from "vscode";
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
    name = "C-S-/";
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
    name = "M-r";
    private curPos: "center" | "top" | "bottom" = "bottom";
    public motionRun(editor: TextEditor): Position {
        let line = 0;
        let range0 = editor.visibleRanges[0];

        let c = emacs.commandRing.back();
        if (!(c && c.name === 'M-r')) {
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
        return new Position(line, 0);
    }

    public interrupt() {
        this.curPos = "bottom";
    }
}

@registerGlobalCommand
class ScrollDownCommand extends MotionExtCommand {
    name = "M-v";
    public motionRun(editor: TextEditor): Position | undefined {
        let range0 = editor.visibleRanges[0];
        if (range0.start.line === 0) {
            return;
        }
        runNativeCommand("revealLine", {
            lineNumber: range0.start.line,
            at: "bottom"
        });
        return new Position(range0.start.line, 0);
    }
}

@registerGlobalCommand
class ScrollUpCommand extends MotionExtCommand {
    name = "C-v";
    public motionRun(editor: TextEditor): Position | undefined {
        let range0 = editor.visibleRanges[0];
        if (range0.end.line >= editor.document.lineCount - 1) {
            return;
        }
        runNativeCommand("revealLine", {
            lineNumber: range0.end.line,
            at: "top"
        });
        return new Position(range0.end.line, 0);
    }

}

@registerGlobalCommand
class RecenterTopBottom extends MotionCommand {
    name = "C-l";
    private curPos: "center" | "top" | "bottom" = "bottom";
    public motionRun(doc: TextDocument, pos: Position): Position | undefined {
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
        runNativeCommand("revealLine", {
            "lineNumber": pos.line,
            "at": this.curPos
        });
        return;
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
        } else if (s === 'Del') {
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
        })
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
                }, c - 1);
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
    name = 'C-s';
}

@registerGlobalCommand
class FakeISearchBackWard extends FakeSearch {
    name = 'C-r';
    increase = false;
}