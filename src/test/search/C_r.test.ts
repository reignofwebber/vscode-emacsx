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
        title: 'ISearch backward: C-r',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: ['C-r', 'q'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, handle letters',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: ['C-r', 'q', 'u', 'i', 'c', 'k'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, handle C-r',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: ['C-r', 'q', 'u', 'C-r', 'C-r', 'C-r'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, use C-r to isearch, handle failed search',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: ['C-r', 'q', 'u', 'C-r', 'C-r', 'C-r', 'C-r'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 0, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, use C-r to isearch, handle backspace 1',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: ['C-r', 'T', 'h', '__Del__', '__Del__', 't', 'h'],
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 27 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, use C-r to isearch, handle backspace 2',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: 'C-r q u i c k __Del__'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 1, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, use C-r to isearch, handle C-s',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: 'C-r q u C-r C-r C-s'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 2, character: 4 },
        }
    });

    testSearch({
        title: 'ISearch backward: C-r, back to start',
        content: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        },
        commands: 'C-r q u C-r C-r C-r C-r C-u C-Spc'.split(' '),
        expect: {
            textArray: [
                'The quick brown fox jumps over the lazy dog',
                'The quic brown fox jumps over the lazy dog',
                'The qui brown fox jumps over the lazy dog',
                'The qu brown fox jumps over the lazy dog',
                'The q brown fox jumps over the lazy dog',
            ],
            pos: { line: 4, character: 39 },
        }
    });


});