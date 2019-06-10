import { emacs } from "../state";
import { registerGlobalCommand, Command, IRepeat, RepeatType } from "./base";
import { Selection, Position } from "vscode";


export function active() {

}


@registerGlobalCommand
class MarkCommand extends Command {
    name = "C-Spc";
    repeatType = RepeatType.Accept;
    public run(arg: any, repeat?: IRepeat): void {
        if (repeat) {
            // TODO rolling a number
            let pos = emacs.markRing.rolling();
            if (pos) {
                emacs.setCurrentPosition(pos, true);
            }
        } else {
            emacs.toggleMark();
        }
    }
}

@registerGlobalCommand
class ExchangePointAndMark extends Command {
    name = 'C-x C-x';
    public run(): void {
        emacs.exchangeMark();
    }
}

@registerGlobalCommand
class PopGlobalMark extends Command {
    name = 'C-x C-Spc';
    public run(): void {
        emacs.markRing.clear();
    }
}

@registerGlobalCommand
class MarkWholeBuffer extends Command {
    name = 'C-x h';
    public run(): void {
        let doc = emacs.editor.doc;
        if (doc) {
            let endPos = new Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
            emacs.setMarkPos(endPos);
            emacs.editor.sel = new Selection(endPos, new Position(0, 0));
        }
    }
}
