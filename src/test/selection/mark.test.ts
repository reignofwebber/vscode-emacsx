import { testSelection } from './selectionUtils';
import { getFileName } from "../testBase";
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { emacs } from '../../state';

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

    teardown(() => {
        // after each test, deactive mark and clear mark ring.
        emacs.setMark(false);
        emacs.markRing.clear();
    });

    testSelection({
        title: 'move in empty buffer',
        content: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-Spc'],
        expect: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testSelection({
        title: 'set mark and move character',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-Spc', 'C-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 1 },
            anchor: { line: 0, character: 0 },
        }
    });

    testSelection({
        title: 'set mark and move words',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc M-f M-f C-b'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 14 },
            anchor: { line: 0, character: 5 },
        }
    });

    testSelection({
        title: 'deactivate mark',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc C-Spc M-f C-b'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 8 },
            anchor: { line: 0, character: 8 },
        }
    });

    testSelection({
        title: 'mark is active, set mark when move',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc M-f M-f C-Spc C-b'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 14 },
            anchor: { line: 0, character: 15 },
        }
    });

    testSelection({
        title: 'mark with universal-argument (NOTE. just back to one step currently)',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc C-Spc C-n C-e C-u C-Spc'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        }
    });

    testSelection({
        title: 'mark with combined with universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc C-Spc C-n C-Spc C-Spc C-e C-u C-Spc C-x z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        }
    });

    testSelection({
        title: 'exchange mark',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc C-n C-e C-x C-x'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 1, character: 24 },
        }
    });

    testSelection({
        title: 'mark whole buffer',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-x h'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 1, character: 24 },
        }
    });

    testSelection({
        title: 'clear mark',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'C-Spc C-Spc C-n C-e C-x C-Spc C-u C-Spc'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 1, character: 24 },
            anchor: { line: 1, character: 24 },
        }
    });


});