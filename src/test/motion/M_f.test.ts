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
        commands: ['M-f'],
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
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 3 },
        }
    });

    testMotion({
        title: 'move when cursor at end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        }
    });

    testMotion({
        title: 'move when cursor at past-the-end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        }
    });

    testMotion({
        title: 'move when cursor at last word of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 40 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move when cursor at last word of buffer with whitespace',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 39 },
        },
        commands: ['M-f'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move when cursor at end of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 40 },
        },
        commands: ['M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 3 },
        }
    });

    testMotion({
        title: 'move when cursor at the last word of line',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 38 },
        },
        commands: ['M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 39 },
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: ['C-u', '5', 'M-f'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 30 },
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: 'M-f C-x z z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 30 },
        }
    });

    testMotion({
        title: 'move with combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 0, character: 6 },
        },
        commands: 'C-u 2 M-f C-x z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy ',
                'dog.'
            ],
            pos: { line: 1, character: 3 },
        }
    });

});