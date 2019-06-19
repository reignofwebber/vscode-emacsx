import { emacs } from "../state";
import { registerGlobalCommand, Command } from "./base";
import { Selection, Position } from "vscode";
import { RepeatType, IRepeat } from "../global";


export function active() {

}

// TODO C-Spc Spc Spc
@registerGlobalCommand
class MarkCommand extends Command {
    name = "C-Spc";
    repeatType = RepeatType.Accept;
    repeat: IRepeat | undefined;

    // TODO BUG HERE --> last pos
    private rolling() {
        // TODO rolling a number
        let pos = emacs.markRing.rolling();
        if (pos) {
            emacs.setCurrentPosition(pos, true);
        }
    }

    public async run(repeat?: IRepeat) {
        if (repeat) {
            this.rolling();
        } else {
            emacs.toggleMark();
        }
        // record last call is `C-u` or without `C-u`
        this.repeat = repeat;
    }

    public async repeatRun() {
        if (this.repeat) {
            this.rolling();
        }
        // else do nothing
    }
}

@registerGlobalCommand
class ExchangePointAndMark extends Command {
    name = 'C-x C-x';
    public async run() {
        emacs.exchangeMark();
    }
}

@registerGlobalCommand
class PopGlobalMark extends Command {
    name = 'C-x C-Spc';
    public async run() {
        emacs.markRing.clear();
    }
}

@registerGlobalCommand
class MarkWholeBuffer extends Command {
    name = 'C-x h';
    public async run() {
        let doc = emacs.editor.doc;
        if (doc) {
            let endPos = new Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
            emacs.setMarkPos(endPos);
            emacs.editor.sel = new Selection(endPos, new Position(0, 0));
        }
    }
}
