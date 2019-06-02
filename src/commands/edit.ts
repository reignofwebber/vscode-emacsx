import {TextDocument, Position, TextEditor, Range, DocumentHighlight} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerCommand, Command } from "./base";
import * as logic from "./logichelper";


export function active() {

}

class EditCommand extends Command {

    public run(): void {
        let editor = emacs.editor.ed;
        if (editor) {
            this.editRun(editor.document, emacs.editor.pos);
        }
    }

    public editRun(doc: TextDocument, pos: Position): Position | void {

    }

    public delete(range: Range, putInKillRing: boolean = true) {
        let editor = emacs.editor.ed;

        if (putInKillRing) {
            emacs.killRing.push(emacs.editor.text(range));
        }

        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.delete(range);
            });
        }
    }


}

@registerCommand
class DeleteChar extends EditCommand {
    name = "C-d";
    public editRun(doc: TextDocument, pos: Position): void {
        let l = doc.lineAt(pos.line).text.length;
        // last pos
        if (pos.line >= doc.lineCount - 1 && pos.character >= l) {
            return;
        }
        let range: Range;
        if (pos.character >= l) {
            range = new Range(pos.line, pos.character, pos.line + 1, 0);
        } else {
            range = new Range(pos.line, pos.character, pos.line, pos.character + 1);
        }
        this.delete(range, false);
    }
}

@registerCommand
class KillLine extends EditCommand {
    name = "C-k";
    public editRun(doc: TextDocument, pos: Position): void {
        let l = doc.lineAt(pos.line).text.length;
        // last pos
        if (pos.line >= doc.lineCount - 1 && pos.character >= l) {
            return;
        }
        let range: Range;
        if (pos.character >= l) {
            range = new Range(pos.line, pos.character, pos.line + 1, 0);
        } else {
            range = new Range(pos.line, pos.character, pos.line, l);
        }

        this.delete(range);
    }
}

@registerCommand
class KillWord extends EditCommand {
    name = "M-d";
    public editRun(doc: TextDocument, pos: Position): void {
        let forWord = logic.getForWardWordPos(doc, pos);
        let range = new Range(pos, forWord);
        this.delete(range);
    }
}

@registerCommand
class BackwardKillWord extends EditCommand {
    name = "M-del";
    public editRun(doc: TextDocument, pos: Position): void {
        let backWord = logic.getBackWardWordPos(doc, pos);
        let range = new Range(backWord, pos);
        this.delete(range);
    }
}
