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
        title: 'test C-m in middle of line',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        },
        commands: ['C-m'],
        expect: {
            textArray: [
                'The quick ',
                'brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        }
    });

    testEdit({
        title: 'test C-m in beginning of line',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-m'],
        expect: {
            textArray: [
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 0 },
            anchor: { line: 1, character: 0 },
        }
    });

    testEdit({
        title: 'test C-m with uiversal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: ['C-u', 'C-m'],
        expect: {
            textArray: [
                '',
                '',
                '',
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 4, character: 0 },
            anchor: { line: 4, character: 0 },
        }
    });

    testEdit({
        title: 'test C-m with repeat',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-m C-x z z z'.split(' '),
        expect: {
            textArray: [
                '',
                '',
                '',
                '',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 4, character: 0 },
            anchor: { line: 4, character: 0 },
        }
    });

    testEdit({
        title: 'test C-j in middle of line',
        content: {
            textArray: [
                '  The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 10 },
            anchor: { line: 0, character: 10 },
        },
        commands: ['C-j'],
        expect: {
            textArray: [
                '  The quick brown fox jumps',
                '  ',
                ' over the lazy dog.'
            ],
            active: { line: 1, character: 2 },
            anchor: { line: 1, character: 2 },
        }
    });

    testEdit({
        title: 'test C-o in middle of line',
        content: {
            textArray: [
                '  The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 17 },
            anchor: { line: 0, character: 17 },
        },
        commands: ['C-o'],
        expect: {
            textArray: [
                '  The quick brown',
                ' fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 17 },
            anchor: { line: 0, character: 17 },
        }
    });

    testEdit({
        title: 'test C-o with universal-argument',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 5 C-o'.split(' '),
        expect: {
            textArray: [
                '','','','','',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

    testEdit({
        title: 'test C-o combined universal-argument and repeat',
        content: {
            textArray: [
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 2 C-o C-x z z'.split(' '),
        expect: {
            textArray: [
                '','','','','','',
                'The quick brown fox jumps',
                ' over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        }
    });

});