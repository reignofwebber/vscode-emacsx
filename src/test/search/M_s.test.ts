import { testSearch } from './searchUtils';
import { getFileName } from "../testBase";
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { emacs } from '../../state';


let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {

    teardown(() => {
        // cancel search
        emacs.command.push('C-g');
    });

    testSearch({
        title: 'ISearchCh: M-s',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: ['M-s', 'q'],
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 4},
        }
    });

    testSearch({
        title: 'ISearchCh: C-s, handle letters',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: ['M-s', 'q', 'q', 'q', 'q', 'q'],
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 4},
        }
    });

    testSearch({
        title: 'ISearchCh: M-s, handle failed search',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: ['M-s', 'q', 'q', 'q', 'q', 'q', 'q'],
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 4},
        }
    });

    testSearch({
        title: 'ISearchCh: C-s, handle backspace',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: ['M-s', 't', '__Del__', 'T'],
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 1, character: 0 },
        }
    });

    testSearch({
        title: 'ISearchCh: M-s, handle backspace 2',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: 'M-s q q q q q __Del__'.split(' '),
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 3, character: 4 },
        }
    });

    testSearch({
        title: 'ISearchCh: M-s, back to start',
        content: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0},
        },
        commands: 'M-s q q q q q C-u C-Spc'.split(' '),
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 0 },
        }
    });


});