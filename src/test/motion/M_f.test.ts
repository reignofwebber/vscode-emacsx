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
        commands: ['M-f'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at beginning of file',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 3 },
        }
    });

    testMotion({
        title: 'move when cursor at end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        }
    });

    testMotion({
        title: 'move when cursor at past-the-end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        }
    });

    testMotion({
        title: 'move when cursor at last word of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 40 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move when cursor at last word of buffer with whitespace',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 39 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move when cursor at end of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 40 },
        },
        commands: ['M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 3 },
        }
    });

    testMotion({
        title: 'move when cursor at the last word of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 38 },
        },
        commands: ['M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 39 },
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: ['C-u', '5', 'M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 30 },
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: 'M-f C-x z z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 30 },
        }
    });

    testMotion({
        title: 'move with combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: 'C-u 2 M-f C-x z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 3 },
        }
    });

});