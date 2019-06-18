import { testEdit } from './editUtils';
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

    testEdit({
        title: 'test `C-x C-o` when cursor at non-blank line 1',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                '',
                '',
                '',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when cursor at non-blank line 2',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when cursor at blank line 1',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                '',
                '',
                '',
                '',
                ' over the lazy dog.'
            ],
            active: { line: 3, character: 0 },
            anchor: { line: 3, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                '',
                ' over the lazy dog.'
            ],
            active: { line: 2, character: 0 },
            anchor: { line: 2, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when cursor at blank line 2',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                '',
                ' over the lazy dog.'
            ],
            active: { line: 2, character: 0 },
            anchor: { line: 2, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 2, character: 0 },
            anchor: { line: 2, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when cursor at blank line (beginning of file) 1',
        content: {
            textArray: [
                '',
                '',
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when cursor at blank line (beginning of file) 2',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when blank line at the end of file 1',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                '',
                '',
                ''
            ],
            active: { line: 2, character: 0 },
            anchor: { line: 2, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                ''
            ],
            active: { line: 2, character: 0 },
            anchor: { line: 2, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when blank line at the end of file 2',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                '',
                '',
                ''
            ],
            active: { line: 3, character: 0 },
            anchor: { line: 3, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                ''
            ],
            active: { line: 3, character: 0 },
            anchor: { line: 3, character: 0 },
        }
    });

    testEdit({
        title: 'test `C-x C-o` when blank line at the end of file 2',
        content: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                '',
                '',
                ''
            ],
            active: { line: 3, character: 0 },
            anchor: { line: 3, character: 0 },
        },
        commands: ['C-x', 'C-o'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.',
                ''
            ],
            active: { line: 3, character: 0 },
            anchor: { line: 3, character: 0 },
        }
    });

    testEdit({
        title: 'test `M-\\` when blank line at the end of file 2',
        content: {
            textArray: [
                'trailing space here.            ',
            ],
            active: { line: 0, character: 32 },
            anchor: { line: 0, character: 32 },
        },
        commands: ['C-e', 'M-\\'],
        expect: {
            textArray: [
                'trailing space here.',
            ],
            active: { line: 0, character: 20 },
            anchor: { line: 0, character: 20 },
        }
    });


});