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