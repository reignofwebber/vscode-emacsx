import * as assert from 'assert';
import * as vscode from "vscode";

import { IContent, ContentTest, IContentCase, testContent } from "../testBase";
import { join } from 'path';
import { tmpdir } from 'os';


interface ISearch extends IContent{
    pos: {
        line: number;
        character: number
    };
}


class SearchTest extends ContentTest {
    public constructor() {
        super(join(tmpdir(), 'searchtest'));
    }
    public async insertContent(content: ISearch) {
        await super.insertContent(content);
        let active = new vscode.Position(content.pos.line, content.pos.character);
        vscode.window.activeTextEditor!.selection = new vscode.Selection(active, active);
    }

    public retrieveContent(): ISearch {
        let content: IContent = super.retrieveContent();
        let editor = vscode.window.activeTextEditor;
        assert.ok(editor);

        return {
            textArray: content.textArray,
            pos: editor!.selection.active
        };
    }

    public contentEqual(l: ISearch, r: ISearch) {
        if (!super.contentEqual(l, r)) {
            return false;
        }
        // compare active position
        if (l.pos.line !== r.pos.line || l.pos.character !== r.pos.character) {
            console.log(`except pos ${l.pos.line}:${l.pos.character}, but current pos: ${r.pos.line}:${r.pos.character}`);
            return false;
        }
        return true;
    }
}

let motionTest = new SearchTest();

export function testSearch(testCase: IContentCase<ISearch>, cb?: () => boolean) {
    testContent<ISearch>(motionTest, testCase, cb);
}
