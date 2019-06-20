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
        emacs.killRing.clear();
    });


    testEdit({
        title: 'yank test `M-d`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'M-f M-f M-d C-e M-b M-b M-f C-y'.split(' '),
        expect: {
            textArray: ['The quick fox jumps over the lazy brown dog.'],
            active: { line: 0, character: 39 },
            anchor: { line: 0, character: 39 },
        }
    });

    testEdit({
        title: 'yank test continuous `M-d`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u 3 M-d M-d C-e C-y'.split(' '),
        expect: {
            textArray: [' jumps over the lazy dog.The quick brown fox'],
            active: { line: 0, character: 44 },
            anchor: { line: 0, character: 44 },
        }
    });

    testEdit({
        title: 'yank test `M-del`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 16 },
            anchor: { line: 0, character: 16 },
        },
        commands: 'M-del C-e M-b C-y'.split(' '),
        expect: {
            textArray: ['The quick fox jumps over the lazy brown dog.'],
            active: { line: 0, character: 40 },
            anchor: { line: 0, character: 40 },
        }
    });

    testEdit({
        title: 'yank test continuous `M-del`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 16 },
            anchor: { line: 0, character: 16 },
        },
        commands: 'C-e C-u 2 M-del M-del C-a C-y'.split(' '),
        expect: {
            textArray: ['the lazy dog.The quick brown fox jumps over '],
            active: { line: 0, character: 13 },
            anchor: { line: 0, character: 13 },
        }
    });

    testEdit({
        title: 'yank test `C-w`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-Spc C-u M-f C-w C-e C-y'.split(' '),
        expect: {
            textArray: [' jumps over the lazy dog.The quick brown fox'],
            active: { line: 0, character: 44 },
            anchor: { line: 0, character: 44 },
        }
    });

    testEdit({
        title: 'yank test `M-w`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-Spc C-u M-f M-w C-e C-y'.split(' '),
        expect: {
            textArray: ['The quick brown fox jumps over the lazy dog.The quick brown fox'],
            active: { line: 0, character: 63 },
            anchor: { line: 0, character: 63 },
        }
    });

    testEdit({
        title: 'yank test `C-k`',
        content: {
            textArray: ['The quick brown fox jumps over the lazy dog.'],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-u M-f C-k C-a C-y'.split(' '),
        expect: {
            textArray: [' jumps over the lazy dog.The quick brown fox'],
            active: { line: 0, character: 25 },
            anchor: { line: 0, character: 25 },
        }
    });

    testEdit({
        title: 'yank test continuous`C-k`',
        content: {
            textArray: [
                'The quick brown ',
                'fox jumps ',
                'over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-k C-k C-k C-y'.split(' '),
        expect: {
            textArray: [
                'The quick brown ',
                'fox jumps ',
                'over the lazy dog.'
            ],
            active: { line: 1, character: 10 },
            anchor: { line: 1, character: 10 },
        }
    });

    testEdit({
        title: 'pop yank',
        content: {
            textArray: [
                'The quick brown ',
                'fox jumps ',
                'over the lazy dog.'
            ],
            active: { line: 0, character: 0 },
            anchor: { line: 0, character: 0 },
        },
        commands: 'C-k C-n C-k C-n C-k C-y M-y M-y'.split(' '),
        expect: {
            textArray: [
                '',
                '',
                'The quick brown ',
             ],
            active: { line: 2, character: 16 },
            anchor: { line: 2, character: 16 },
        }
    });


    // testEdit({
    //     title: 'kill at the end of file',
    //     content: {
    //         textArray: ['The quick brown fox jumps over the lazy dog.'],
    //         active: { line: 0, character: 44 },
    //         anchor: { line: 0, character: 44 },
    //     },
    //     commands: ['C-k'],
    //     expect: {
    //         textArray: ['The quick brown fox jumps over the lazy dog.'],
    //         active: { line: 0, character: 44 },
    //         anchor: { line: 0, character: 44 },
    //     }
    // });

    // testEdit({
    //     title: 'kill at the end of line',
    //     content: {
    //         textArray: [
    //             'The quick brown fox ',
    //             'jumps over the lazy dog.'
    //         ],
    //         active: { line: 0, character: 20 },
    //         anchor: { line: 0, character: 20 },
    //     },
    //     commands: ['C-k'],
    //     expect: {
    //         textArray: ['The quick brown fox jumps over the lazy dog.'],
    //         active: { line: 0, character: 20 },
    //         anchor: { line: 0, character: 20 },
    //     }
    // });

    // testEdit({
    //     title: 'kill mulitple times',
    //     content: {
    //         textArray: [
    //             'The quick ',
    //             'brown fox ',
    //             'jumps over the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     },
    //     commands: 'C-k '.repeat(10).trim().split(' '),
    //     expect: {
    //         textArray: [''],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     }
    // });

    // testEdit({
    //     title: 'kill with universal-argument 1',
    //     content: {
    //         textArray: [
    //             'The ',
    //             'quick ',
    //             'brown',
    //             ' fox ',
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     },
    //     commands: 'C-u C-k'.split(' '),
    //     expect: {
    //         textArray: [
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     }
    // });

    // testEdit({
    //     title: 'kill with universal-argument 2',
    //     content: {
    //         textArray: [
    //             'The ',
    //             'quick ',
    //             'brown',
    //             ' fox ',
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     },
    //     commands: 'C-u 1 0 C-k'.split(' '),
    //     expect: {
    //         textArray: [
    //             ''
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     }
    // });

    // testEdit({
    //     title: 'delete with repeat',
    //     content: {
    //         textArray: [
    //             'The ',
    //             'quick ',
    //             'brown',
    //             ' fox ',
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     },
    //     commands: 'C-k C-x z z z z z z z'.split(' '),
    //     expect: {
    //         textArray: [
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],

    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     }
    // });

    // testEdit({
    //     title: 'delete combined universal-argument and repeat',
    //     content: {
    //         textArray: [
    //             'The ',
    //             'quick ',
    //             'brown',
    //             ' fox ',
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     },
    //     commands: 'C-u 2 C-k C-x z'.split(' '),
    //     expect: {
    //         textArray: [
    //             'jumps over',
    //             ' the lazy dog.'
    //         ],
    //         active: { line: 0, character: 0 },
    //         anchor: { line: 0, character: 0 },
    //     }
    // });

});