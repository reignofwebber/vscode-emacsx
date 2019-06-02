import {TextDocument, Position, TextEditor} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerCommand, Command } from "./base";
import * as logic from "./logichelper";


export function active() {

}


class MotionCommand extends Command {
    sequential = true;
    public run(): void {
        let doc = emacs.editor.doc;
        if (doc) {
            let pos = emacs.editor.pos;
            let tar = this.motionRun(doc, pos);
            if (tar) {
                emacs.setCurrentPosition(tar);
            }
        }
    }

    public motionRun(doc: TextDocument, pos: Position) : Position | undefined {
        return;
    }
}

class MotionExtCommand extends Command {
    sequential = true;
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

@registerCommand
class Undo extends Command {
    name = "C-/";
    public run(): void {
        runNativeCommand("undo");
    }
}

@registerCommand
class Redo extends Command {
    name = "C-S-/";
    public run(): void {
        runNativeCommand("redo");
    }
}


@registerCommand
class CursorMoveF extends Command {
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

@registerCommand
class CursorMoveB extends Command {
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

@registerCommand
class CursorMoveN extends MotionExtCommand {
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

@registerCommand
class CursorMoveP extends MotionExtCommand {
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

@registerCommand
class CursorMoveFw extends MotionCommand {
    name = "M-f";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return logic.getForWardWordPos(doc, pos);
    }
}

@registerCommand
class CursorMoveBw extends MotionCommand {
    name = "M-b";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return logic.getBackWardWordPos(doc, pos);
    }
}

@registerCommand
class CursorMoveSl extends MotionCommand {
    name = "C-a";
    public motionRun(doc: TextDocument, pos: Position): Position {
        return new Position(pos.line, 0);
    }
}

@registerCommand
class CursorMoveEl extends MotionCommand {
    name = "C-e";
    public motionRun(doc: TextDocument, pos: Position): Position {
        let endChIndex = doc.lineAt(pos.line).text.length;
        return new Position(pos.line, endChIndex);
    }
}

@registerCommand
class CursorMoveSf extends MotionCommand {
    name = "M-<";
    public motionRun(doc: TextDocument, pos: Position): Position {
        runNativeCommand("revealLine", {
            lineNumber: 0,
            at: "top"
        });
        return new Position(0, 0);
    }
}

@registerCommand
class CursorMoveEf extends MotionCommand {
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
@registerCommand
class CursorMoveCycle extends MotionExtCommand {
    name = "M-r";
    private curPos: "center" | "top" | "bottom" = "bottom";
    public motionRun(editor: TextEditor): Position {
        let line = 0;
        let range0 = editor.visibleRanges[0];
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

@registerCommand
class ScrollDown extends MotionExtCommand {
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

@registerCommand
class ScrollUp extends MotionExtCommand {
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

@registerCommand
class CenterWindow extends MotionCommand {
    name = "C-l";
    private curPos: "center" | "top" | "bottom" = "bottom";
    public motionRun(doc: TextDocument, pos: Position): Position | undefined {
        runNativeCommand("revealLine", {
            "lineNumber": pos.line,
            "at": this.curPos
        });
        if (this.curPos === "bottom") {
            this.curPos = "center";
        } else if (this.curPos === "center") {
            this.curPos = "top";
        } else {
            this.curPos = "bottom";
        }
        return;
    }
}