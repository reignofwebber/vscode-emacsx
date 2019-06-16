import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs, RectangleText } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command, IRepeat, RepeatType } from "./base";
import * as logic from "./logichelper";
import _ = require("lodash");



export function active() {

}

class EditCommand extends Command {
    change = true;
    repeatType = RepeatType.Accept;

    protected repeatNum = 1;

    protected editor: TextEditor | undefined;
    protected doc: TextDocument | undefined;
    protected pos: Position = new Position(0, 0);

    get selection() :Selection | undefined {
        return emacs.editor.sel;
    }

    public run(repeat?: IRepeat) {
        emacs.setMark(false);
        this.editor = emacs.editor.ed;
        this.pos = emacs.editor.pos;
        this.repeatNum = repeat ? repeat.repeatByNumber ? repeat.num : 4 ** (repeat.num + 1) : 1;
        if (this.editor) {
            this.doc = this.editor.document;
            this.editRun();
        }
        emacs.setCurrentPosition();
    }

    public editRun() {

    }

    public deactive() {
        this.repeatNum = 1;
    }

    public insert(pos: Position, text: string, callback?: () => void) {
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
    public editRun(): void {
        let endPos = logic.getNextByNum(this.doc!, this.pos, this.repeatNum);
        this.delete(new Range(this.pos, endPos), false);
    }
}

@registerGlobalCommand
class KillLine extends EditCommand {
    name = "C-k";
    public editRun(): void {
        let l = this.doc!.lineAt(this.pos.line).text.length;
        // last pos
        if (this.pos.line >= this.doc!.lineCount - 1 && this.pos.character >= l) {
            return;
        }
        let range: Range;
        if (this.pos.character >= l) {
            range = new Range(this.pos.line, this.pos.character, this.pos.line + 1, 0);
        } else {
            range = new Range(this.pos.line, this.pos.character, this.pos.line, l);
        }

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            this.delete(range, true, true);
        } else {
            this.delete(range, true);
        }

    }
}

@registerGlobalCommand
class KillRegion extends EditCommand {
    name = "C-w";
    public editRun() {
        this.runHelper();
    }

    private async runHelper() {
        let selection = this.selection;
        // run native copy command
        await runNativeCommand('editor.action.clipboardCopyAction');

        if (selection) {
            this.delete(selection, true);
        }

    }
}

@registerGlobalCommand
class KillRingSave extends EditCommand {
    name = "M-w";
    public editRun() {
        // run native copy command
        runNativeCommand('editor.action.clipboardCopyAction');

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
    public editRun() {
        let text = emacs.killRing.back();
        if (text) {
            let offset = this.doc!.offsetAt(this.pos) + text.length;
            this.insert(this.pos, text, () => {
                let endPos = this.doc!.positionAt(offset);
                emacs.yankRange = new Range(this.pos, endPos);
                emacs.setCurrentPosition(endPos);
            });
        }
    }
}

@registerGlobalCommand
class YankPop extends EditCommand {
    name = "M-y";

    private replaceYank() {
        let text = emacs.killRing.rolling();
        if (text) {
            this.replace(emacs.yankRange, text);
        }
    }

    public editRun() {
        let c = emacs.commandRing.back();
        if (c && c.name === 'C-y') {
            // roll to pass the back string.
            emacs.killRing.rolling();
            this.replaceYank();
            this._trace = true;
            this.stayActive = true;
        } else {
            this._trace = false;
            emacs.updateStatusBar('Previous commond was not a yank');
        }
    }

    public push(s: string): boolean {
        if (s === this.name) {
            this.replaceYank();
            return true;
        } else {
            this.stayActive = false;
            return false;
        }

    }

    public deactive() {
        emacs.killRing.resetCursor();
    }
}

@registerGlobalCommand
class KillWord extends EditCommand {
    name = "M-d";
    public editRun() {
        let forWord = logic.getForWardWordPos(this.doc!, this.pos);
        let range = new Range(this.pos, forWord);

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            this.delete(range, true, true);
        } else {
        this.delete(range, true);
    }
}
}

@registerGlobalCommand
class BackwardKillWord extends EditCommand {
    name = "M-del";
    public editRun() {
        let backWord = logic.getBackWardWordPos(this.doc!, this.pos);
        let range = new Range(backWord, this.pos);

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            this.delete(range, true, true, false);
        } else {
        this.delete(range, true);
    }
}
}

@registerGlobalCommand
class NewLineMayBeIndent extends EditCommand {
    name = "C-j";
    public editRun() {
        runNativeCommand('C-e').then(() => {
            runNativeCommand('C-m');
        });
    }
}

@registerGlobalCommand
class NewLine extends EditCommand {
    name = 'C-m';
    public editRun() {
        runNativeCommand('default:type', {
            text: '\n'
        });
    }
}

@registerGlobalCommand
class IndentNewCommentLine extends EditCommand {
    name = 'M-j';
    public editRun() {
        runNativeCommand('default:type', {
            text: '\n'
        }).then(() => {
            runNativeCommand('editor.action.commentLine');
        });
    }
}

@registerGlobalCommand
class OpenLine extends EditCommand {
    name = "C-o";
    public editRun() {
        this.insert(this.pos, '\n', () => {
            emacs.setCurrentPosition(this.pos);
        });
    }
}

@registerGlobalCommand
class DeleteBlankLines extends EditCommand {
    name = "C-x C-o";
    public editRun() {
        let doc = this.doc!;
        let pos = this.pos;
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
class DeleteHorizontalSpace extends EditCommand {
    name = 'M-\\';
    public editRun() {
        let doc = this.doc!;
        let pos = this.pos;
        if (pos.character === 0) {
            return;
        }

        let c = _.findLastIndex(doc.lineAt(pos.line).text, c => {
            return ' \t'.indexOf(c) === -1;
        }, pos.character - 1) + 1;

        // no space to trim
        if (c === pos.character) {
            return;
        }

        this.delete(new Range(new Position(pos.line, c), pos), false);
    }
}


@registerGlobalCommand
class KillRectangle extends EditCommand {
    name = "C-x r k";
    del = true;
    public editRun() {
        let doc = this.doc!;
        let pos = this.pos;
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
        if (this.del) {
            this.deleteRanges(rs);
        }
    }
}

@registerGlobalCommand
class CopyRectangleAsKill extends KillRectangle {
    name = 'C-x r w';
    del = false;
}

@registerGlobalCommand
class YankRectangle extends EditCommand {
    name = 'C-x r y';
    public editRun() {
        this.yank(this.doc!, this.pos);
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

@registerGlobalCommand
class ZapToChar extends EditCommand {
    name = 'M-z';

    public editRun() {
        emacs.updateStatusBar('Zap to char: ');
        this.stayActive = true;
    }

    public push(s: string):boolean {
        // if s is charactor
        if (/^[\x00-\x7f]$/.exec(s)) {
            let endPos = this.pos;
            while (this.repeatNum--) {
                endPos = logic.getNextByNum(this.doc!, logic.getNextByChar(this.doc!, endPos, s));
            }

            this.delete(new Range(this.pos, endPos), true);

            emacs.updateStatusBar('');
            this.stayActive = false;
            return true;
        }
        this.stayActive = false;
        return false;
    }
}