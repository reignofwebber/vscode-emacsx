import { testEdit } from './editUtils';
import { getFileName } from '../testBase';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { emacs } from "../../emacs";


let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {

    teardown(() => {
        // after each test, deactive mark and clear mark ring.
        emacs.setMark(false);
        emacs.markRing.clear();
    });

    testEdit({
        title: 'cut text',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        },
        commands: 'C-Spc M-f M-f M-b C-w'.split(' '),
        expect: {
            textArray: ['The quick fox jumps over the lazy dog.'],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        }
    });
});