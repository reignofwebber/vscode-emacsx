import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs, RectangleText } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command } from "./base";
import * as logic from "./logichelper";



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

    public delete(range: Range, putInKillRing: boolean, concat: boolean = false, positive: boolean = true) {
        let editor = emacs.editor.ed;

        if (putInKillRing) {
            let text = emacs.editor.text(range);
            if (text.length > 0) {
                if (concat) {
                    emacs.killRing.extendsBack(text, positive);
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


    public async deleteRanges(ranges: Range[]) {
        let editor = emacs.editor.ed;
        if (editor) {
            for (let range of ranges) {
                await editor.edit(editBuilder => {
                    editBuilder.delete(range);
                });
            }
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

        let name = emacs.commandRing.back();
        if (name && name === this.name) {
            this.delete(range, true, true);
        } else {
        this.delete(range, true);
    }
}
}

@registerGlobalCommand
class BackwardKillWord extends EditCommand {
    name = "M-del";
    public editRun(doc: TextDocument, pos: Position): void {
        let backWord = logic.getBackWardWordPos(doc, pos);
        let range = new Range(backWord, pos);

        let name = emacs.commandRing.back();
        if (name && name === this.name) {
            this.delete(range, true, true, false);
        } else {
        this.delete(range, true);
    }
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


@registerGlobalCommand
class KillRectangle extends EditCommand {
    name = "C-x r k";
    public editRun(doc: TextDocument, pos: Position) {
        let corner = emacs.markRing.back();
        if (!corner) {
            return;
        }
        let leftTop: Position = new Position(
            pos.line < corner.line ? pos.line : corner.line,
            pos.character < corner.character ? pos.character : corner.character);
        let rightBottom: Position = new Position(
            pos.line > corner.line ? pos.line : corner.line,
            pos.character > corner.character ? pos.character : corner.character
        );

        // a rectangle
        let rs: Range[] = [];
        let s: string = '';
        for (let l = leftTop.line; l <= rightBottom.line; ++l) {
            let c = leftTop.character !== rightBottom.character ? rightBottom.character : doc.lineAt(l).text.length;
            let startPos = new Position(l, leftTop.character);
            let endPos = new Position(l, c);
            let r = new Range(startPos, endPos);
            s += doc.getText(r);
            if (l !== rightBottom.line) {
                s += '\n';
            }
            rs.push(r);
        }
        emacs.rectangleRing.push(new RectangleText(s));
        
        this.deleteRanges(rs);
    }
}

@registerGlobalCommand
class YankRectangle extends EditCommand {
    name = 'C-x r y';
    public editRun(doc: TextDocument, pos: Position) {
        this.yank(doc, pos);
    }

    public async yank(doc: TextDocument, pos: Position) {
        let r = emacs.rectangleRing.back();
        if (!r) {
            return;
        }

        let editor = emacs.editor.ed as TextEditor;
        // expand line if line count unsatisfied
        let h = r.height;
        if (pos.line + h > doc.lineCount) {
            let lastPos = new Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
            await editor.edit(editBuilder => {
                editBuilder.insert(lastPos, '\n'.repeat(pos.line + h - doc.lineCount));
            });
        }
        // expand character if character unsatisfired by prefix whitespace.
        let chPerLine = pos.character;
        let line = pos.line;
        let endPos: Position = new Position(pos.line, pos.character);
        for (let s of r) {
            let insertPos: Position;
            let chCount = doc.lineAt(line).text.length;
            if (chPerLine > chCount) {
                s = ' '.repeat(chPerLine - chCount) + s;
                insertPos = new Position(line, chCount);
                endPos = new Position(line, chCount + s.length);                
            } else {
                insertPos = new Position(line, chPerLine);
                endPos = new Position(line, chPerLine + s.length);                
            }
            // yank
            await editor.edit(editBuilder => {
                editBuilder.insert(insertPos, s);
            });

            ++line;
        }
        emacs.setCurrentPosition(endPos);

    }
}