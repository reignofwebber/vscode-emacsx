import * as vscode from "vscode";
import { SSL_OP_ALL } from "constants";

export let wordSeparators = getWordSeparators();

function getWordSeparators(): string {
    let editorConfig = vscode.workspace.getConfiguration('editor');
    let s =  editorConfig['wordSeparators'];
    s += ' \t';
    return s;
}