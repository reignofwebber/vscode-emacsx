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
        commands: ['M-del'],
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
        commands: ['M-del'],
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'delete mulitple times',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 21 },
            anchor: { line: 0, character: 21 },
        },
        commands: 'M-del M-del M-del'.split(' '),
        expect: {
            textArray: ['The quick umps over the lazy dog.'],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        }
    });

    testEdit({
        title: 'delete at the beginning of line',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        },
        commands: 'M-del M-del M-del'.split(' '),
        expect: {
            textArray: [
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'delete with universal-argument 1',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 13 },
            anchor: { line: 1, character: 13 },
        },
        commands: 'C-u M-del'.split(' '),
        expect: {
            textArray: [
                'The quick er the lazy dog.'
            ],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        }
    });

    testEdit({
        title: 'delete with universal-argument 2',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 13 },
            anchor: { line: 1, character: 13 },
        },
        commands: 'C-u 3 M-del'.split(' '),
        expect: {
            textArray: [
                'The quick brown',
                ' er the lazy dog.'
            ],

            active: { line: 1, character: 1 },
            anchor: { line: 1, character: 1 },
        }
    });

    testEdit({
        title: 'delete with repeat',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 27 },
            anchor: { line: 1, character: 27 },
        },
        commands: 'M-del C-x z z z z z'.split(' '),
        expect: {
            textArray: [
                'The quick brown',
                ' g.'
            ],
            active: { line: 1, character: 1 },
            anchor: { line: 1, character: 1 },
        }
    });

    testEdit({
        title: 'delete combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy dog.'
            ],
            active: { line: 1, character: 27 },
            anchor: { line: 1, character: 27 },
        },
        commands: 'C-u M-del C-x z'.split(' '),
        expect: {
            textArray: [
                'The g.'
            ],
            active: { line: 0, character: 4 },
            anchor: { line: 0, character: 4 },
        }
    });

});