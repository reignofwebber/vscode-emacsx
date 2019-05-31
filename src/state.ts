import * as vscode from "vscode";


/**
 * emacs state
 */
class Emacs {
    private mark: boolean = false;
    constructor() {
        // active editor changed
        vscode.window.onDidChangeActiveTextEditor((textEditor) => {
            // TODO
        });

    }

    public getCurrentDocument(): vscode.TextDocument | undefined {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.document;
        }
        return undefined;
    }

    public getCurrentSelection(): vscode.Selection | undefined {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.selection;
        }
        return undefined;
    }

    public getCurrentPosition(): vscode.Position {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.selection.active;
        }
        return new vscode.Position(0, 0);
    }

    public setCurrentPosition(pos: vscode.Position): void {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.selection.active = pos;
        }
    }

}

export let emacs = new Emacs();