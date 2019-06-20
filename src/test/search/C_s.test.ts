import { testSearch } from './searchUtils';
import { getFileName } from "../testBase";
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { emacs } from '../../emacs';


let display = getFileName(__filename);
let fileName = path.join(os.tmpdir(), display);

suite(display, () => {

    teardown(() => {
        // cancel search
        emacs.command.push('C-g');
    });

    testSearch({
        title: 'ISearch: C-s',
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
        commands: ['C-s', 'q', 'u'],
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 1, character: 4},
        }
    });

    testSearch({
        title: 'ISearch: C-s, continue input letters',
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
        commands: ['C-s', 'q', 'u', 'i', 'c', 'k'],
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
        title: 'ISearch: C-s, handle C-s',
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
        commands: ['C-s', 'q', 'u', 'C-s', 'C-s', 'C-s'],
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
        title: 'ISearch: C-s, use C-s to isearch, handle failed search',
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
        commands: ['C-s', 'q', 'u', 'C-s', 'C-s', 'C-s', 'C-s'],
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
        title: 'ISearch: C-s, use C-s to isearch, handle backspace 1',
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
        commands: ['C-s', 't', 'h', '__Del__', '__Del__', 'T', 'h'],
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
        title: 'ISearch: C-s, use C-s to isearch, handle backspace 2',
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
        commands: 'C-s q u i c k __Del__'.split(' '),
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
        title: 'ISearch: C-s, use C-s to isearch, handle C-r',
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
        commands: 'C-s q u C-s C-s C-r'.split(' '),
        expect: {
            textArray: [
                'The q brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The quick brown fox jumps over the lazy dog',
            ],
            pos: { line: 2, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch: C-s, back to start',
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
        commands: 'C-s q u C-s C-s C-s C-r C-u C-Spc'.split(' '),
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