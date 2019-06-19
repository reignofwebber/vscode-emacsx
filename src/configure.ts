import * as vscode from "vscode";
import { IRepeat } from "./global";

let selfConfig = vscode.workspace.getConfiguration('emacsx');


// wordSeparators
export let wordSeparators = getWordSeparators();
function getWordSeparators(): string {
    let editorConfig = vscode.workspace.getConfiguration('editor');
    let s =  editorConfig['wordSeparators'];
    s += ' \t';
    return s;
}

// C-u size
export function getRepeatNum(repeat?: IRepeat, useDefaultSize: boolean = true) {
    let stepSize: number = selfConfig.stepSize < 1 ? 1 : selfConfig.stepSize;
    let r = repeat ? repeat.repeatByNumber ? repeat.num : stepSize ** (repeat.num + 1) : 1;
    if (r > 10000 || r < 0) {
        console.log(`unexpect r size:${r}, size reset to 1`);
        r = 1;
    }
    return r;
}

// kill ring size
export let killRingSize = selfConfig.killRingSize;

// mark ring size
export let markRingSize = selfConfig.markRingSize;

// trailing mode
export let enableBinaryTargetLine = selfConfig.enableBinaryTargetLine;