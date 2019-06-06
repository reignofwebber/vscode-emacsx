import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command } from "./base";
import * as logic from "./logichelper";
import { start } from "repl";


export function active() {

}

class EditCommand extends Command {

    get selection() :Selection | undefined {
        return emacs.editor.sel;
    }

    public run(): void {
        emacs.setMark(false);
        let editor = emacs.editor.ed;
        if (editor) {
            this.editRun(editor.document, emacs.editor.pos);
        }
        emacs.setCurrentPosition();
    }

    public editRun(doc: TextDocument, pos: Position): Position | void {

    }

    public insert(pos: Position, text: string, callback: () => void) {
        let editor = emacs.editor.ed;

        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(pos, text);
            }).then(callback);
        }
    }

    public replace(yankRange: Range, text: string) {
        let editor = emacs.editor.ed;

        if (editor) {
            let doc = editor.document;
            let offset = doc.offsetAt(yankRange.start) + text.length;

            editor.edit(editBuilder => {
                editBuilder.replace(yankRange, text);
            }).then(() => {
                let newPos = doc.positionAt(offset);
                emacs.yankRange = new Range(yankRange.start, newPos);
                emacs.setCurrentPosition(newPos);
            });
        }
    }

    public delete(range: Range, putInKillRing: boolean, concat: boolean = false) {
        let editor = emacs.editor.ed;

        if (putInKillRing) {
            let text = emacs.editor.text(range);
            if (text.length > 0) {
                if (concat) {
                    emacs.killRing.extendsBack(text);
                } else {
                    emacs.killRing.push(text);
                }
            }
        }

        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.delete(range);
            }).then(() => {
                emacs.setCurrentPosition(range.start);
            });
        }
    }

    public deleteWithCallback(range: Range, callback: () => void) {
        let editor = emacs.editor.ed;

        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.delete(range);
            }).then(callback);
        }
    }


}

@registerGlobalCommand
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

@registerGlobalCommand
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

        let name = emacs.commandRing.back();
        if (name && name === this.name) {
            this.delete(range, true, true);
        } else {
            this.delete(range, true);
        }

    }
}

@registerGlobalCommand
class KillRegion extends EditCommand {
    name = "C-w";
    public editRun(doc: TextDocument, pos: Position): void {
        if (this.selection) {
            this.delete(this.selection, true);
        }
    }
}

@registerGlobalCommand
class KillRingSave extends EditCommand {
    name = "M-w";
    public editRun(doc: TextDocument, pos: Position): void {
        if (this.selection) {
            let text = emacs.editor.text(this.selection);
            if (text.length > 0) {
                emacs.killRing.push(text);
            }
        }

    }
}

@registerGlobalCommand
class Yank extends EditCommand {
    name = "C-y";
    public editRun(doc: TextDocument, pos: Position): void {
        let text = emacs.killRing.back();
        if (text) {
            let offset = doc.offsetAt(pos) + text.length;
            this.insert(pos, text, () => {
                let endPos = doc.positionAt(offset);
                emacs.yankRange = new Range(pos, endPos);
                emacs.setCurrentPosition(endPos);
            });
        }
    }
}

@registerGlobalCommand
class YankPop extends EditCommand {
    name = "M-y";
    public editRun(doc: TextDocument, pos: Position): void {
        let name = emacs.commandRing.back();
        if (name && (name === 'C-y' || name === 'M-y')) {
            let text = emacs.killRing.rolling();
            if (text) {
                this.replace(emacs.yankRange, text);
            }
            this.trace = true;
        } else {
            this.trace = false;
            emacs.updateStatusBar('Previous commond was not a yank');
        }
    }
}

@registerGlobalCommand
class KillWord extends EditCommand {
    name = "M-d";
    public editRun(doc: TextDocument, pos: Position): void {
        let forWord = logic.getForWardWordPos(doc, pos);
        let range = new Range(pos, forWord);
        this.delete(range, true);
    }
}

@registerGlobalCommand
class BackwardKillWord extends EditCommand {
    name = "M-del";
    public editRun(doc: TextDocument, pos: Position): void {
        let backWord = logic.getBackWardWordPos(doc, pos);
        let range = new Range(backWord, pos);
        this.delete(range, true);
    }
}

@registerGlobalCommand
class NewLineMayBeIndent extends EditCommand {
    name = "C-j";
    public editRun(doc: TextDocument, pos: Position): void {
        runNativeCommand('default:type', {
            text: '\n'
        });
    }
}

@registerGlobalCommand
class OpenLine extends EditCommand {
    sequential = true;
    name = "C-o";
    public editRun(doc: TextDocument, pos: Position): void {
        this.insert(pos, '\n', () => {
            emacs.setCurrentPosition(pos);
        });
    }
}

@registerGlobalCommand
class DeleteBlankLines extends EditCommand {
    name = "C-x C-o";
    public editRun(doc: TextDocument, pos: Position): void {
        let ct = doc.lineAt(pos.line).text;
        let endLine = pos.line;
        if (pos.line + 1 < doc.lineCount) {
            endLine = pos.line + 1;
            let curText = doc.lineAt(endLine).text;
            while (endLine < doc.lineCount - 1 && /^\s*$/.exec(curText)) {
                ++endLine;
                curText = doc.lineAt(endLine).text;
            }
        }
        // if current line is empty, delete empty line previous this line.
        if (/^\s*$/.exec(ct)) {
            let curLine = pos.line;
            let curText = doc.lineAt(curLine).text;
            while (curLine > 0 && /^\s*$/.exec(curText)) {
                --curLine;
                curText = doc.lineAt(curLine).text;
            }
            let startLine = curLine === 0 ? 0 : curLine + 1;
            this.deleteWithCallback(new Range(startLine, 0, endLine - 1, 0), () => {
                emacs.setCurrentPosition(new Position(startLine, 0));
            });
        } else {
            this.deleteWithCallback(new Range(pos.line + 1, 0, endLine, 0), () => {
                emacs.setCurrentPosition(pos);
            });
        }

    }
}