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
        commands: ['M-l'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0},
        }
    });

    // TODO
    // affect by visibleRanges
    // testMotion({
    //     title: 'move center',
    //     content: {
    //         textArray: [
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //         ],
    //         pos: { line: 3, character: 0},
    //     },
    //     commands: ['C-f','M-l'],
    //     expect: {
    //         textArray: [
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //         ],
    //         pos: { line: 11, character: 0},
    //     }
    // });

    // testMotion({
    //     title: 'move top',
    //     content: {
    //         textArray: [
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //         ],
    //         pos: { line: 3, character: 0},
    //     },
    //     commands: ['C-f','M-l', 'M-l'],
    //     expect: {
    //         textArray: [
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //             'a','a','a','a','a','a',
    //         ],
    //         pos: { line: 0, character: 0},
    //     }
    // });

});