import {TextDocument, Position} from "vscode";
import * as vscode from "vscode";
import { emacs } from "./state";
import { runNativeCommand } from "./runner";
import { wordSeparators } from "./configure";

export let commandMap: {
    [key: string]: any
} = {};

class Command {
    name: string = "";
    public run(): void {

    }
}

class MotionCommand extends Command {
    public run(): void {
        let doc = emacs.getCurrentDocument();
        if (doc) {
            let pos = emacs.getCurrentPosition();
            let tar = this.motionRun(doc, pos);
            emacs.setCurrentPosition(tar);
        }
    }

    public motionRun(doc: TextDocument, pos: Position) : Position {
        return new Position(0, 0);
    }
}

function registerCommand(command: typeof Command) {
    let c = new command();
    commandMap[c.name] = c.run;
}

@registerCommand
class CursorMoveF extends Command {
    name = "emacsx.C-f";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "right",
            by: "character",
            value: 1,
            select: false
        });
    }
}

@registerCommand
class CursorMoveB extends Command {
    name = "emacsx.C-b";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "left",
            by: "character",
            value: 1,
            select: false
        });
    }
}

@registerCommand
class CursorMoveN extends Command {
    name = "emacsx.C-n";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "down",
            by: "character",
            value: 1,
            select: false
        });
    }
}

@registerCommand
class CursorMoveP extends Command {
    name = "emacsx.C-p";
    public run(): void {
        runNativeCommand("cursorMove", {
            to: "up",
            by: "character",
            value: 1,
            select: false
        });
    }
}

@registerCommand
class CursorMoveFw extends MotionCommand {
    name = "emacsx.M-f";
    public motionRun(doc: TextDocument, pos: Position): Position {
        let lineText = doc.lineAt(pos.line).text;
        if (pos.character >= lineText.length - 1) {
            return ((pos.line + 1) < doc.lineCount? new Position(pos.line + 1, 0) : pos);
        }
        let chIndex = pos.character;
        for (; chIndex < lineText.length; ++chIndex) {
            let char = lineText.charAt(chIndex);
            if (wordSeparators.indexOf(char) !== -1) {
                break;
            }
        }

        return new Position(pos.line, chIndex);
    }
}