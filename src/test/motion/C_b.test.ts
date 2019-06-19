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
            pos: { line: 0, character: 0 },
        },
        commands: ['C-b'],
        expect: {
            textArray: [''],
            pos: { line: 0, character: 0 },
        }
    });

    testMotion({
        title: 'move when cursor at the middle of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 5 },
        },
        commands: ['C-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 4 },
        }
    });

    testMotion({
        title: 'move when cursor at the start of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        },
        commands: ['C-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 0 },
        }
    });

    testMotion({
        title: 'move when cursor at the end of buffer',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 44 },
        },
        commands: ['C-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move when cursor at end of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: ['C-b'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 44 },
        }
    });

    testMotion({
        title: 'move multiple steps when cursor at end of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: 'C-b C-b C-b'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 42 },
        }
    });

    testMotion({
        title: 'move with universal-argument',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: 'C-u 1 0 C-b'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 35 },
        }
    });

    testMotion({
        title: 'move with repeat',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: 'C-b C-x z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 43 },
        }
    });

    testMotion({
        title: 'move with repeat with trailing `z`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: 'C-b C-x z z z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 41 },
        }
    });

    testMotion({
        title: 'move combined universal-argument and repeat',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 1, character: 0 },
        },
        commands: 'C-u 3 C-b C-x z z'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.',
                ''],
            pos: { line: 0, character: 36 },
        }
    });
});