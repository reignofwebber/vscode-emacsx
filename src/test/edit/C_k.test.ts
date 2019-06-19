import { testEdit } from './editUtils';
import { getFileName } from '../testBase';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';


let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {

    testEdit({
        title: 'edit in empty buffer',
        content: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-k'],
        expect: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'edit at the beginning of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-k'],
        expect: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'kill in the middle of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 19 },
            anchor: { line: 0, character: 19 },
        },
        commands: ['C-k'],
        expect: {
            textArray: ['The quick brown fox'],
            active: { line: 0, character: 19 },
            anchor: { line: 0, character: 19 },
        }
    });

    testEdit({
        title: 'kill at the end of file',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 44 },
            anchor: { line: 0, character: 44 },
        },
        commands: ['C-k'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 44 },
            anchor: { line: 0, character: 44 },
        }
    });

    testEdit({
        title: 'kill at the end of line',
        content: {
            textArray: [
                'The quick brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 20 },
            anchor: { line: 0, character: 20 },
        },
        commands: ['C-k'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 20 },
            anchor: { line: 0, character: 20 },
        }
    });

    testEdit({
        title: 'kill mulitple times',
        content: {
            textArray: [
                'The quick ',
                'brown fox ',
                'jumps over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-k '.repeat(10).trim().split(' '),
        expect: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'kill with universal-argument 1',
        content: {
            textArray: [
                'The ',
                'quick ',
                'brown',
                ' fox ',
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u C-k'.split(' '),
        expect: {
            textArray: [
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'kill with universal-argument 2',
        content: {
            textArray: [
                'The ',
                'quick ',
                'brown',
                ' fox ',
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 1 0 C-k'.split(' '),
        expect: {
            textArray: [
                ''
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'delete with repeat',
        content: {
            textArray: [
                'The ',
                'quick ',
                'brown',
                ' fox ',
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-k C-x z z z z z z z'.split(' '),
        expect: {
            textArray: [
                'jumps over',
                ' the lazy dog.'
            ],

            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'delete combined universal-argument and repeat',
        content: {
            textArray: [
                'The ',
                'quick ',
                'brown',
                ' fox ',
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 2 C-k C-x z'.split(' '),
        expect: {
            textArray: [
                'jumps over',
                ' the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

});