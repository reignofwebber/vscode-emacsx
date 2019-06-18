import { testMotion } from './motionUtils';
import { getFileName } from '../testBase';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';


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
        commands: ['M-b'],
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
        commands: ['M-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        }
    });

    testMotion({
        title: 'move when cursor at end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        },
        commands: ['M-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 40 },
        }
    });

    testMotion({
        title: 'move when cursor after first word of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 3 },
        },
        commands: ['M-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        }
    });

    testMotion({
        title: 'move when cursor after first word of buffer with whitespace',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 4 },
        },
        commands: ['M-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        }
    });

    testMotion({
        title: 'move when cursor at beginning of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 0 },
        },
        commands: ['M-b'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 35 },
        }
    });

    testMotion({
        title: 'move when cursor at the first word of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 2 },
        },
        commands: ['M-b'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 0 },
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 2 },
        },
        commands: ['C-u', '5', 'M-b'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 20 },
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 2 },
        },
        commands: 'M-b C-x z z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 20 },
        }
    });

    testMotion({
        title: 'move with combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 2 },
        },
        commands: 'C-u 2 M-b C-x z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 4 },
        }
    });

});