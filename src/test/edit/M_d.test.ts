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
        commands: ['M-d'],
        expect: {
            textArray: [''],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'edit in beginning of line',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['M-d'],
        expect: {
            textArray: [' quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'delete mulitple times',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        },
        commands: 'M-d M-d M-d'.split(' '),
        expect: {
            textArray: ['The q jumps over the lazy dog.'],
            active: { line: 0, character: 5 },
            anchor: { line: 0, character: 5 },
        }
    });

    testEdit({
        title: 'delete at the end of file',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 10 },
            anchor: { line: 1, character: 10 },
        },
        commands: 'M-d '.repeat(10).trim().split(' '),
        expect: {
            textArray: [
                'The quick brown',
                ' fox jumps'
            ],
            active: { line: 1, character: 10 },
            anchor: { line: 1, character: 10 },
        }
    });

    testEdit({
        title: 'delete at the end of line',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 14 },
            anchor: { line: 0, character: 14 },
        },
        commands: 'M-d M-d M-d'.split(' '),
        expect: {
            textArray: [
                'The quick brow over the lazy dog.',
            ],
            active: { line: 0, character: 14 },
            anchor: { line: 0, character: 14 },
        }
    });

    testEdit({
        title: 'delete with universal-argument 1',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 6 },
            anchor: { line: 0, character: 6 },
        },
        commands: 'C-u M-d'.split(' '),
        expect: {
            textArray: [
                'The qu over the lazy dog.'
            ],
            active: { line: 0, character: 6 },
            anchor: { line: 0, character: 6 },
        }
    });

    testEdit({
        title: 'delete with universal-argument 2',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 3 },
            anchor: { line: 0, character: 3 },
        },
        commands: 'C-u 3 M-d'.split(' '),
        expect: {
            textArray: [
                'The jumps over the lazy dog.',
            ],

            active: { line: 0, character: 3 },
            anchor: { line: 0, character: 3 },
        }
    });

    testEdit({
        title: 'delete with repeat',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 4 },
            anchor: { line: 0, character: 4 },
        },
        commands: 'M-d C-x z z z z z'.split(' '),
        expect: {
            textArray: [
                'The  lazy dog.'
            ],

            active: { line: 0, character: 4 },
            anchor: { line: 0, character: 4 },
        }
    });

    testEdit({
        title: 'delete combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 1 },
            anchor: { line: 0, character: 1 },
        },
        commands: 'C-u M-d C-x z'.split(' '),
        expect: {
            textArray: [
                'T dog.'
            ],
            active: { line: 0, character: 1 },
            anchor: { line: 0, character: 1 },
        }
    });

});