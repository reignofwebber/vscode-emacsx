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
            pos: { line: 0, character: 0 },
        },
        commands: ['C-n'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0 },
        }
    });


    // use `C-f` to refresh `baseColumn`
    testMotion({
        title: 'move when cursor at the middle of buffer 1',
        content: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 5 },
        },
        commands: 'C-f C-n'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 6 },
        }
    });

    testMotion({
        title: 'move when cursor at the middle of buffer 2',
        content: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 21 },
        },
        commands: 'C-f C-n'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 14 },
        }
    });

    testMotion({
        title: 'move when cursor at last line of buffer',
        content: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 2, character: 1 },
        },
        commands: 'C-f C-n'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps ',
                'over the lazy ',
                'dog.'
            ],
            pos: { line: 2, character: 2 },
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: [
                'The quick ',
                'brown fox ',
                'jumps over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 4 },
        },
        commands: 'C-f C-u C-n'.split(' '),
        expect: {
            textArray: [
                'The quick ',
                'brown fox ',
                'jumps over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 4, character: 4 },
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: [
                'The quick ',
                'brown fox ',
                'jumps over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 4 },
        },
        commands: 'C-f C-n C-x z z z'.split(' '),
        expect: {
            textArray: [
                'The quick ',
                'brown fox ',
                'jumps over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 4, character: 4 },
        }
    });

    testMotion({
        title: 'move with combined universal-argument and repeat',
        content: {
            textArray: [
                'The',
                ' quick ',
                'brown',
                ' fox ',
                'jumps',
                ' over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 1 },
        },
        commands: 'C-f C-u 2 C-n C-x z z'.split(' '),
        expect: {
            textArray: [
                'The',
                ' quick ',
                'brown',
                ' fox ',
                'jumps',
                ' over ',
                'the lazy ',
                'dog.'
            ],
            pos: { line: 6, character: 2 },
        }
    });

});