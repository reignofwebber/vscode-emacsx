//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import { testMotion, getFileName } from './motionUtils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together

let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {
    suiteSetup(async () => {
        fs.writeFileSync(fileName, '');
        let doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fileName));
        await vscode.window.showTextDocument(doc);
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        fs.unlinkSync(fileName);
    });

    testMotion({
        title: 'move in empty buffer',
        content: {
            textArray: [''],
            pos: { line: 0, character: 0},
        },
        commands: ['M-m'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the middle of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 10},
        },
        commands: ['M-m'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the beginning of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        },
        commands: ['M-m'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the middle of buffer, text is indented',
        content: {
            textArray: ['    The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 10},
        },
        commands: ['M-m'],
        expect: {
            textArray: ['    The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 4},
        }
    });

    testMotion({
        title: 'move when cursor at the beginning of buffer, text is indented',
        content: {
            textArray: ['    The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        },
        commands: ['M-m'],
        expect: {
            textArray: ['    The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 4},
        }
    });

    testMotion({
        title: 'move when cursor at middle of line',
        content: {
            textArray: ['The quick brown fox jumps',
                        ' over the lazy dog.'],
            pos: { line: 1, character: 10},
        },
        commands: ['M-m'],
        expect: {
            textArray: ['The quick brown fox jumps',
                        ' over the lazy dog.'],
            pos: { line: 1, character: 1},
        }
    });
});