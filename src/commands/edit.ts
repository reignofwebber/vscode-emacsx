import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs, RectangleText } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, RepeatableCommand } from "./base";
import * as logic from "./logichelper";
import _ = require("lodash");
import { IRepeat } from "../global";
import { getRepeatNum } from "../configure";



export function active() {

}

class EditCommand extends RepeatableCommand {
    change = true;

    protected editor: TextEditor | undefined;
    protected doc: TextDocument | undefined;
    protected pos: Position = new Position(0, 0);
    protected repeatNum: number = 1;
    // C-k use
    protected repeat: IRepeat | undefined;

    get selection() :Selection | undefined {
        return emacs.editor.sel;
    }

    public async run(repeat?: IRepeat) {
        emacs.setMark(false);
        this.editor = emacs.editor.ed;
        this.pos = emacs.editor.pos;
        this.repeat = repeat;
        this.repeatNum = getRepeatNum(repeat);
        if (this.editor) {
            this.doc = this.editor.document;
            await this.editRun();
        }
        // deactive selection
        emacs.setCurrentPosition();
    }

    public async repeatRun() {
        if (this.editor) {
            await this.editRun();
        }
    }

    public async editRun() {

    }

    public async insert(pos: Position, text: string) {
        let editor = emacs.editor.ed;

        if (editor) {
            await editor.edit(editBuilder => {
                editBuilder.insert(pos, text);
            });
        }
    }

    public async replace(range: Range, text: string) {
        if (this.editor) {
            await this.editor.edit(editBuilder => {
                editBuilder.replace(range, text);
            });
        }
    }

    public async delete(range: Range, putInKillRing: boolean, concat: boolean = false, positive: boolean = true) {
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
            await editor.edit(editBuilder => {
                editBuilder.delete(range);
            });
            emacs.setCurrentPosition(range.start);
            this.pos = emacs.editor.pos;
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
    public async editRun() {
        let endPos = logic.getNextByNum(this.doc!, this.pos, this.repeatNum);
        await this.delete(new Range(this.pos, endPos), false);
    }
}

@registerGlobalCommand
class KillLine extends EditCommand {
    name = "C-k";
    public async editRun() {
        let l = this.doc!.lineAt(this.pos.line).text.length;
        // last pos
        if (this.pos.line === this.doc!.lineCount - 1 && this.pos.character === l) {
            return;
        }
        let range: Range;
        if (this.repeat) {
            let endLine = this.pos.line + this.repeatNum > this.doc!.lineCount - 1 ? this.doc!.lineCount : this.pos.line + this.repeatNum;
            range = new Range(this.pos.line, this.pos.character, endLine, 0);
        } else {
            if (this.pos.character === l) {
                range = new Range(this.pos.line, this.pos.character, this.pos.line + 1, 0);
            } else {
                range = new Range(this.pos.line, this.pos.character, this.pos.line, l);
            }
        }

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            await this.delete(range, true, true);
        } else {
            await this.delete(range, true);
        }

    }
}

@registerGlobalCommand
class KillRegion extends EditCommand {
    name = "C-w";
    public async editRun() {
        await this.runHelper();
    }

    private async runHelper() {
        let selection = this.selection;
        // run native copy command
        await runNativeCommand('editor.action.clipboardCopyAction');

        if (selection) {
            await this.delete(selection, true);
        }

    }
}

@registerGlobalCommand
class KillRingSave extends EditCommand {
    name = "M-w";
    public async editRun() {
        // run native copy command
        await runNativeCommand('editor.action.clipboardCopyAction');

        if (this.selection) {
            let text = emacs.editor.text(this.selection);
            if (text.length > 0) {
                emacs.killRing.push(text);
            }
        }
    }
}

// TODO handle C-u
@registerGlobalCommand
class Yank extends EditCommand {
    name = "C-y";
    public async editRun() {
        let text = emacs.killRing.back();
        if (text) {
            let offset = this.doc!.offsetAt(this.pos) + text.length;
            await this.insert(this.pos, text);
            let endPos = this.doc!.positionAt(offset);
            emacs.yankRange = new Range(this.pos, endPos);
            emacs.setCurrentPosition(endPos);
        }
    }
}

// handle C-u
@registerGlobalCommand
class YankPop extends EditCommand {
    name = "M-y";

    private async replaceYank() {
        let text = emacs.killRing.rolling();
        if (text) {
            let yankRange = emacs.yankRange;

            if (this.editor) {
                let doc = this.editor.document;
                let offset = doc.offsetAt(yankRange.start) + text.length;

                await this.editor.edit(editBuilder => {
                    editBuilder.replace(yankRange, text!);
                });
                let newPos = doc.positionAt(offset);
                emacs.yankRange = new Range(yankRange.start, newPos);
                emacs.setCurrentPosition(newPos);
            }
        }
    }

    public async editRun() {
        let c = emacs.commandRing.back();
        if (c && c.name === 'C-y') {
            // roll to pass the back string.
            emacs.killRing.rolling();
            await this.replaceYank();
            this._trace = true;
            this.stayActive = true;
        } else {
            this._trace = false;
            emacs.updateStatusBar('Previous commond was not a yank');
        }
    }

    public async push(s: string): Promise<boolean> {
        if (s === this.name) {
            await this.replaceYank();
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
    public async editRun() {
        let endPos = this.pos;
        for (let i = 0; i < this.repeatNum; ++i) {
            endPos = logic.getForWardWordPos(this.doc!, endPos);
        }
        let range = new Range(this.pos, endPos);

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            await this.delete(range, true, true);
        } else {
        await this.delete(range, true);
    }
}
}

@registerGlobalCommand
class BackwardKillWord extends EditCommand {
    name = "M-del";
    public async editRun() {
        let endPos = this.pos;
        for (let i = 0; i < this.repeatNum; ++i) {
            endPos = logic.getBackWardWordPos(this.doc!, endPos);
        }
        let range = new Range(endPos, this.pos);

        let c = emacs.commandRing.back();
        if (c && c.name === this.name) {
            await this.delete(range, true, true, false);
        } else {
        await this.delete(range, true);
    }
}
}

@registerGlobalCommand
class NewLineMayBeIndent extends EditCommand {
    name = "C-j";
    public async editRun() {
        await runNativeCommand('C-e');
        await runNativeCommand('default:type', {
            text: '\n'.repeat(this.repeatNum)
        });
    }
}

@registerGlobalCommand
class NewLine extends EditCommand {
    name = 'C-m';
    public async editRun() {
        await runNativeCommand('default:type', {
            text: '\n'.repeat(this.repeatNum)
        });
    }
}

@registerGlobalCommand
class IndentNewCommentLine extends EditCommand {
    name = 'M-j';
    public async editRun() {
        runNativeCommand('default:type', {
            text: '\n'
        }).then(() => {
            runNativeCommand('editor.action.commentLine');
        });
    }
}

// FIXME ? C-o blink with sync...
@registerGlobalCommand
class OpenLine extends EditCommand {
    name = "C-o";
    public async editRun() {
        await this.insert(this.pos, '\n'.repeat(this.repeatNum));
        emacs.setCurrentPosition(this.pos);
    }
}

@registerGlobalCommand
class DeleteBlankLines extends EditCommand {
    name = "C-x C-o";
    public async editRun() {
        let doc = this.doc!;
        let pos = this.pos;
        let ct = doc.lineAt(pos.line).text;
        // search downward until find `endLine` which means the first non-blank line
        let endLine = pos.line;
        let endText = doc.lineAt(endLine).text;
        // search start at  (curLine + 1)
        if (pos.line + 1 < doc.lineCount) {
            endLine = pos.line + 1;
            endText = doc.lineAt(endLine).text;
            while (endLine < doc.lineCount - 1 && /^\s*$/.exec(endText)) {
                ++endLine;
                endText = doc.lineAt(endLine).text;
            }
        }
        let endLineIsBlank = false;
        if (endLine === doc.lineCount - 1 && /^\s*$/.exec(endText)) {
            endLineIsBlank = true;
        }
        // search upward util find `startLine` which means the first blank line or (cursur pos + 1)
        let curLine = pos.line;
        let curText = doc.lineAt(curLine).text;
        while (curLine >= 0 && /^\s*$/.exec(curText)) {
            --curLine;
            if (curLine < 0) {
                break;
            }
            curText = doc.lineAt(curLine).text;
        }
        let startLine = curLine + 1;
        // if curLine is `endLine - 1` and `startLine`
        if (startLine + 1 === endLine || curLine === pos.line || endLineIsBlank ) {
            await this.delete(new Range(startLine, 0, endLine, 0), false);
            if (curLine === pos.line) {
                emacs.setCurrentPosition(pos);
            } else {
                emacs.setCurrentPosition(new Position(startLine, 0));
            }
        } else {
            await this.delete(new Range(startLine + 1, 0, endLine, 0), false);
            emacs.setCurrentPosition(new Position(startLine, 0));
        }
    }
}

@registerGlobalCommand
class DeleteHorizontalSpace extends EditCommand {
    name = 'M-\\';
    public async editRun() {
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

        await this.delete(new Range(new Position(pos.line, c), pos), false);
    }
}


@registerGlobalCommand
class KillRectangle extends EditCommand {
    name = "C-x r k";
    del = true;
    public async editRun() {
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
            await this.deleteRanges(rs);
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
    public async editRun() {
        await this.yank(this.doc!, this.pos);
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

    private _s: string = '';

    public async editRun() {
        emacs.updateStatusBar('Zap to char: ');
        this.stayActive = true;
    }

    public async push(s: string): Promise<boolean> {
        // if s is charactor
        if (/^[\x00-\x7f]$/.exec(s)) {
            this._s = s;
            await this.zapToChar(s);
            emacs.updateStatusBar('');
            this.stayActive = false;
            return true;
        }
        this.stayActive = false;
        return false;
    }

    public async repeatRun() {
        await this.zapToChar(this._s);
    }

    public async zapToChar(s: string) {
        let repeatNum = this.repeatNum;
        let endPos = this.pos;
        while (repeatNum--) {
            endPos = logic.getNextByNum(this.doc!, logic.getNextByChar(this.doc!, endPos, s));
        }

        await this.delete(new Range(this.pos, endPos), true);
    }
}