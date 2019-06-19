import * as assert from 'assert';
import * as vscode from "vscode";

import { IContent, ContentTest, testContent, IContentCase } from "../testBase"
import { join } from 'path';
import { tmpdir } from 'os';


interface ISelection extends IContent {
    active: {
        line: number;
        character: number
    };
    anchor: {
        line: number;
        character: number
    };
}

class SelectionTest extends ContentTest {
    public constructor() {
        super(join(tmpdir(), 'selectiontest'));
    }
    public async insertContent(content: ISelection) {
        await super.insertContent(content);
        let active = new vscode.Position(content.active.line, content.active.character);
        let anchor = new vscode.Position(content.anchor.line, content.anchor.character);
        vscode.window.activeTextEditor!.selection = new vscode.Selection(active, anchor);
    }

    public retrieveContent(): ISelection {
        let content: IContent = super.retrieveContent();
        let editor = vscode.window.activeTextEditor;
        assert.ok(editor);

        return {
            textArray: content.textArray,
            active: editor!.selection.active,
            anchor: editor!.selection.anchor
        };
    }

    public contentEqual(l: ISelection, r: ISelection) {
        if (!super.contentEqual(l, r)) {
            return false;
        }
        // compare active position
        if (l.active.line !== r.active.line || l.active.character !== r.active.character) {
            console.log(`except active ${l.active.line}:${l.active.character}, but current active: ${r.active.line}:${r.active.character}`);
            return false;
        }
        // compare anchor position
        if (l.anchor.line !== r.anchor.line || l.anchor.character !== r.anchor.character) {
            console.log(`except anchor ${l.anchor.line}:${l.anchor.character}, but current anchor: ${r.anchor.line}:${r.anchor.character}`);
            return false;
        }
        return true;
    }
}

let instance = new SelectionTest();

export function testSelection(testCase: IContentCase<ISelection>, cb?: () => boolean) {
    testContent<ISelection>(instance, testCase, cb);
}
