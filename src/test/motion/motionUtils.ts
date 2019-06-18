import { emacs } from "../../state";
import { commands } from "vscode";
import * as assert from 'assert';
import { openSync } from "fs";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { IContent, ContentTest, IContentCase, testContent } from "../testBase";


interface IMotion extends IContent{
    pos: {
        line: number;
        character: number
    };
}


class MotionTest extends ContentTest {
    public async insertContent(content: IMotion) {
        await super.insertContent(content);
        let active = new vscode.Position(content.pos.line, content.pos.character);
        vscode.window.activeTextEditor!.selection = new vscode.Selection(active, active);
    }

    public retrieveContent(): IMotion {
        let content: IContent = super.retrieveContent();
        let editor = vscode.window.activeTextEditor;
        assert.ok(editor);

        return {
            textArray: content.textArray,
            pos: editor!.selection.active
        };
    }

    public contentEqual(l: IMotion, r: IMotion) {
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

let motionTest = new MotionTest();

export function testMotion(testCase: IContentCase<IMotion>, cb?: () => boolean) {
    testContent<IMotion>(motionTest, testCase, cb);
}
