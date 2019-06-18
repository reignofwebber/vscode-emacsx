import { emacs } from "../../state";
import { commands } from "vscode";
import * as assert from 'assert';
import { openSync } from "fs";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { IContent } from "../interface";


interface IMotionContent extends IContent{
    pos: {
        line: number;
        character: number
    };
}


export interface IMotionCase {
    // title of the test
    title: string;
    // content of the editor
    content: IMotionContent;
    // commandList;
    commands: string[];
    // expect content
    expect: IMotionContent;
}

function contentEqual(l: IMotionContent, r: IMotionContent) {
    if (l.textArray.length !== r.textArray.length) {
        console.log("not equal -->");
        console.log(l.textArray);
        console.log(r.textArray);
        return false;
    }
    // compare strings in arrsy
    for (let i = 0; i < l.textArray.length; ++i) {
        if (l.textArray[i] !== r.textArray[i]) {
            console.log("not equal -->");
            console.log(l.textArray);
            console.log(r.textArray);
            return false;
        }
    }
    // compare pos position
    if (l.pos.line !== r.pos.line || l.pos.character !== r.pos.character) {
        console.log(`except pos ${l.pos.line}:${l.pos.character}, but current pos: ${r.pos.line}:${r.pos.character}`);

        return false;
    }
    return true;
}

export function testMotion(testCase: IMotionCase, cb?: () => boolean) {
    test(testCase.title, async () => {
        await insertContent(testCase.content);
        for (let c of testCase.commands) {
            await emacs.command.push(c);
        }
        let result = retrieveContent();
        assert.ok(contentEqual(testCase.expect, result));
        if (cb) {
            assert.ok(cb);
        }
    });
}


export async function insertContent(content: IMotionContent) {
    let editor = vscode.window.activeTextEditor;
    assert.ok(editor, 'editor...............................');
    let doc = editor!.document;
    let endCh = doc.lineAt(doc.lineCount - 1).text.length;
    let startPos = new vscode.Position(0, 0);
    let endPos = new vscode.Position(doc.lineCount - 1, endCh);

    // replace old content
    await editor!.edit(editBuilder => {
        editBuilder.replace(new vscode.Range(startPos, endPos), content.textArray.join('\n'));
    });

    let pos = new vscode.Position(content.pos.line, content.pos.character);
    vscode.window.activeTextEditor!.selection = new vscode.Selection(pos, pos);
}

function retrieveContent(): IMotionContent {
    let editor = vscode.window.activeTextEditor;
    assert.ok(editor);
    // retrieve text
    let doc = editor!.document;
    let text: string[] = [];
    let curLine = 0;
    while (curLine !== doc.lineCount) {
        text.push(doc.lineAt(curLine).text);
        ++curLine;
    }

    return {
        textArray: text,
        pos: editor!.selection.active
    };
}

export async function WTest() {



}

export async function closeEditor() {
    // await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

export function getFileName(f: string) {
    let name = path.basename(f);
    return  name.split('.')[0];
}
