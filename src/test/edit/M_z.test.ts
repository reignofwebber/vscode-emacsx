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
        title: 'test zap to char',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['M-z', 'j'],
        expect: {
            textArray: ['umps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'test zap to char with universal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u M-z j'.split(' '),
        expect: {
            textArray: [
                'umps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'test zap to char combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 2 M-z j C-x z'.split(' '),
        expect: {
            textArray: [
                'umps over the lazy dog.',
                'The quick brown fox jumps over the lazy dog.',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

});