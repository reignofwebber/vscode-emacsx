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
        title: 'test `C-x r k` 1',
        content: {
            textArray: [
                '| Command        | Desc                           | Conflicted Command  | Solve Conflict |',
                '| -------------- | ------------------------------ | ------------------- | -------------- |',
                '| `C-f`          | forward-char                   | Find                | `ctrl+alt+f`   |',
                '| `C-b`          | backward-char                  | -                   | -              |',
                '| `C-n`          | next-line                      | newUntitleFile      | -              |',
                '| `C-p`          | previous-line                  | -                   | -              |',
                '| `C-a`          | move-beginning-of-line         | selectAll           | `C-x h`        |',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 1 7 C-f C-Spc C-Spc C-u 3 3 C-f C-u 6 C-n C-x r k'.split(' '),
        expect: {
            textArray: [
                '| Command        | Conflicted Command  | Solve Conflict |',
                '| -------------- | ------------------- | -------------- |',
                '| `C-f`          | Find                | `ctrl+alt+f`   |',
                '| `C-b`          | -                   | -              |',
                '| `C-n`          | newUntitleFile      | -              |',
                '| `C-p`          | -                   | -              |',
                '| `C-a`          | selectAll           | `C-x h`        |',
            ],
            active: { line: 6, character: 17 },
            anchor: { line: 6, character: 17 },
        }
    });

    testEdit({
        title: 'test `C-x r k` 2',
        content: {
            textArray: [
                '| Command        | Desc|',
                '| -------------- | ----- |',
                '| `C-f`          | forward-char |',
                '| `C-b`          | backward-char |',
                '| `C-n`          | next-line |',
                '| `C-p`          | previous-line |',
                '| `C-a`          | move-beginning-of-line |'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 1 8 C-f C-Spc C-Spc C-u 6 C-n C-x r k'.split(' '),
        expect: {
            textArray: [
                '| Command        |',
                '| -------------- |',
                '| `C-f`          |',
                '| `C-b`          |',
                '| `C-n`          |',
                '| `C-p`          |',
                '| `C-a`          |'
            ],
            active: { line: 6, character: 18 },
            anchor: { line: 6, character: 18 },
        }
    });

    testEdit({
        title: 'test `C-x r y` with `C-x r k`',
        content: {
            textArray: [
                '| Command        | Desc                           | Conflicted Command  | Solve Conflict |',
                '| -------------- | ------------------------------ | ------------------- | -------------- |',
                '| `C-f`          | forward-char                   | Find                | `ctrl+alt+f`   |',
                '| `C-b`          | backward-char                  | -                   | -              |',
                '| `C-n`          | next-line                      | newUntitleFile      | -              |',
                '| `C-p`          | previous-line                  | -                   | -              |',
                '| `C-a`          | move-beginning-of-line         | selectAll           | `C-x h`        |',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-f C-Spc C-Spc C-u 1 7 C-f C-u 6 C-n C-x r k M-< C-e C-x r y'.split(' '),
        expect: {
            textArray: [
                '| Desc                           | Conflicted Command  | Solve Conflict | Command        |',
                '| ------------------------------ | ------------------- | -------------- | -------------- |',
                '| forward-char                   | Find                | `ctrl+alt+f`   | `C-f`          |',
                '| backward-char                  | -                   | -              | `C-b`          |',
                '| next-line                      | newUntitleFile      | -              | `C-n`          |',
                '| previous-line                  | -                   | -              | `C-p`          |',
                '| move-beginning-of-line         | selectAll           | `C-x h`        | `C-a`          |',
            ],
            active: { line: 6, character: 90 },
            anchor: { line: 6, character: 90 },
        }
    });

    testEdit({
        title: 'test `C-x r y` with `C-x r w`',
        content: {
            textArray: [
                '| Command        |',
                '| -------------- |',
                '| `C-f`          |',
                '| `C-b`          |',
                '| `C-n`          |',
                '| `C-p`          |',
                '| `C-a`          |',
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-f C-Spc C-Spc M-> C-x r w C-u C-u C-p C-x r y'.split(' '),
        expect: {
            textArray: [
                '| Command        | Command        |',
                '| -------------- | -------------- |',
                '| `C-f`          | `C-f`          |',
                '| `C-b`          | `C-b`          |',
                '| `C-n`          | `C-n`          |',
                '| `C-p`          | `C-p`          |',
                '| `C-a`          | `C-a`          |',
            ],
            active: { line: 6, character: 35 },
            anchor: { line: 6, character: 35 },
        }
    });


});