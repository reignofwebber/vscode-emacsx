import * as vscode from "vscode";

export let wordSeparators = getWordSeparators();

function getWordSeparators(): string {
    let editorConfig = vscode.workspace.getConfiguration('editor');
    let s =  editorConfig['wordSeparators'];
    s += ' \t';
    return s;
}

let selfConfig = vscode.workspace.getConfiguration('emacsx');

export let useExtendCommand: boolean = selfConfig.useExtendCommand;
export let repeatInitNumber: number = 4;