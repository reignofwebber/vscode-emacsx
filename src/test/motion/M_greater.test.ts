import { testMotion } from './motionUtils';
import { getFileName } from '../testBase';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';


let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {

    testMotion({
        title: 'move in empty buffer',
        content: {
            textArray: [''],
            pos: { line: 0, character: 0},
        },
        commands: ['M->'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0},
        }
    });

    testMotion({
        title: 'move when cursor at end of file',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            pos: { line: 1, character: 24 },
        },
        commands: ['M->'],
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            pos: { line: 1, character: 24 },
        }
    });

    testMotion({
        title: 'move when cursor at middle of file',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: ['M->'],
        expect: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            pos: { line: 1, character: 24 },
        }
    });

});