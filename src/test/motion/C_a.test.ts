//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import { testMotion, insertContent, closeEditor, TEST_FILE, getFileName } from './testUtils';
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
        commands: ['C-a'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the middle of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 5},
        },
        commands: ['C-a'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the start of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        },
        commands: ['C-a'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at the end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44},
        },
        commands: ['C-a'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at end of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        ''],
            pos: { line: 0, character: 44},
        },
        commands: ['C-a'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        ''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        ''],
            pos: { line: 0, character: 44},
        },
        commands: 'C-u 2 C-a'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        ''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        ''],
            pos: { line: 0, character: 44},
        },
        commands: 'C-a C-x z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        ''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move with repeat with trailing `z`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        '',
                        ''],
            pos: { line: 0, character: 44},
        },
        commands: 'C-a C-x z z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        '',
                        ''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move combined universal-argument and repeat',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        '',
                        ''],
            pos: { line: 0, character: 3},
        },
        commands: 'C-u 1 0 C-a C-x z z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                        '',
                        '',
                        ''],
            pos: { line: 0, character: 0},
        }
    });
});