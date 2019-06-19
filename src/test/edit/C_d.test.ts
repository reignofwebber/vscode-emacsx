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
        commands: ['C-d'],
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
        commands: ['C-d'],
        expect: {
            textArray: ['he quick brown fox jumps over the lazy dog.'],
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
        commands: 'C-d C-d C-d'.split(' '),
        expect: {
            textArray: ['The qk brown fox jumps over the lazy dog.'],
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
            active: { line: 1, character: 25 },
            anchor: { line: 1, character: 25 },
        },
        commands: 'C-d '.repeat(10).trim().split(' '),
        expect: {
            textArray: [
                'The quick brown',
                ' fox jumps over the lazy '
            ],
            active: { line: 1, character: 25 },
            anchor: { line: 1, character: 25 },
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
        commands: 'C-d C-d C-d'.split(' '),
        expect: {
            textArray: [
                'The quick browfox jumps over the lazy dog.',
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
            active: { line: 0, character: 3 },
            anchor: { line: 0, character: 3 },
        },
        commands: 'C-u C-u C-d'.split(' '),
        expect: {
            textArray: [
                'Thex jumps over the lazy dog.',
            ],
            active: { line: 0, character: 3 },
            anchor: { line: 0, character: 3 },
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
        commands: 'C-u 1 5 C-d'.split(' '),
        expect: {
            textArray: [
                'Theox jumps over the lazy dog.',
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
        commands: 'C-d C-x z z z z z'.split(' '),
        expect: {
            textArray: [
                'The brown',
                ' fox jumps over the lazy dog.'
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
            active: { line: 0, character: 4 },
            anchor: { line: 0, character: 4 },
        },
        commands: 'C-u C-d C-x z z z z z'.split(' '),
        expect: {
            textArray: [
                'The ver the lazy dog.'
            ],
            active: { line: 0, character: 4 },
            anchor: { line: 0, character: 4 },
        }
    });

});