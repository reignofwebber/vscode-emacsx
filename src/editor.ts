import * as vscode from "vscode";

/**
 * editor: wrap vscode editor
 */

export class Editor {
    private _editor: vscode.TextEditor | undefined;
    constructor() {
        this._editor = vscode.window.activeTextEditor;
        // active editor changed
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            // TODO
            this._editor = editor;
        });
    }

    get ed(): vscode.TextEditor | undefined {
        return this._editor;
    }

    get doc(): vscode.TextDocument | undefined {
        if (this._editor) {
            return this._editor.document;
        }
        return;
    }

    get sel(): vscode.Selection | undefined {
        if (this._editor) {
            return this._editor.selection;
        }
        return;
    }

    set sel(s: vscode.Selection | undefined) {
        if (this._editor) {
            this._editor.selection = s as vscode.Selection;
        }
    }

    get pos(): vscode.Position {
        if (this._editor) {
            return this._editor.selection.active;
        }
        return new vscode.Position(0, 0);
    }

    public text(range: vscode.Range): string {
        if (this.doc) {
            return this.doc.getText(range);
        }
        return '';
    }

    public setPos(anchor: vscode.Position, active: vscode.Position) {
        if (this._editor) {
            this._editor.selection = new vscode.Selection(anchor, active);
        }
    }

    public revealPos(pos: vscode.Position) {
        if (this._editor) {
            this._editor.revealRange(new vscode.Range(pos, pos));
        }
    }

}
