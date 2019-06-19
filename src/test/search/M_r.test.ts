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
        title: 'ISearchCh backward: M-r',
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
        commands: ['M-r', 'q'],
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
        title: 'ISearchCh backward: M-r, handle letters',
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
        commands: ['M-r', 'q', 'q', 'q', 'q', 'q'],
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
        title: 'ISearchCh backward: M-r, handle failed search',
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
        commands: ['M-r', 'q', 'q', 'q', 'q', 'q', 'q'],
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
        title: 'ISearchCh backward: M-r, handle backspace 1',
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
        commands: ['M-r', 'T', '__Del__', 't'],
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
        title: 'ISearchCh backward: M-r, handle backspace 2',
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
        commands: 'M-r q q q q q __Del__'.split(' '),
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
        title: 'ISearchCh backward: M-r, back to start',
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
        commands: 'M-r q q q q q C-u C-Spc'.split(' '),
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