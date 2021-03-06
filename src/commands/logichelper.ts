import { Position, TextDocument } from "vscode";
import { wordSeparators } from "../configure";
import _ = require("lodash");


export function getForWardWordPos(doc: TextDocument, pos: Position): Position {
    let curLine = pos.line;
    let curChIndex = pos.character;
    let curLineText = doc.lineAt(curLine).text;

    // skip all separators from current pos
    let isBreak = false;
    while (true) {
        for (; curChIndex < curLineText.length; ++curChIndex) {
            let char = curLineText.charAt(curChIndex);
            if (wordSeparators.indexOf(char) === -1) {
                isBreak = true;
                break;
            }
        }
        if (isBreak) {
            break;
        } else {
            ++curLine;
            if (curLine > doc.lineCount - 1) {
                break;
            }
            curLineText = doc.lineAt(curLine).text;
            curChIndex = 0;
        }
    }
    if (!isBreak) {
        return new Position(--curLine, curChIndex);
    }

    // find separator
    isBreak = false;
    while (true) {
        for (; curChIndex <= curLineText.length; ++curChIndex) {
            let char = curLineText.charAt(curChIndex);
            if (wordSeparators.indexOf(char) !== -1) {
                isBreak = true;
                break;
            } else if (curChIndex === curLineText.length) {
                isBreak = true;
                break;
            }
        }
        if (isBreak) {
            break;
        } else {
            ++curLine;
            if (curLine > doc.lineCount - 1) {
                break;
            }
            curLineText = doc.lineAt(curLine).text;
            curChIndex = 0;
        }
    }
    return new Position(curLine, curChIndex);

}

export function getBackWardWordPos(doc: TextDocument, pos: Position): Position {
    let curLine = pos.line;
    let curChIndex = pos.character - 1;
    let curLineText = doc.lineAt(curLine).text;

    // skip all separators from current pos
    let isBreak = false;
    while (true) {
        for (; curChIndex >= 0; --curChIndex) {
            let char = curLineText.charAt(curChIndex);
            if (wordSeparators.indexOf(char) === -1) {
                isBreak = true;
                break;
            }
        }
        if (isBreak) {
            break;
        } else {
            --curLine;
            if (curLine < 0) {
                break;
            }
            curLineText = doc.lineAt(curLine).text;
            curChIndex = curLineText.length - 1;
        }

    }
    if (!isBreak) {
        return new Position(0, 0);
    }

    // find separator
    isBreak = false;
    while (true) {
        for (; curChIndex >= 0; --curChIndex) {
            let char = curLineText.charAt(curChIndex);
            if (wordSeparators.indexOf(char) !== -1) {
                isBreak = true;
                break;
            } else if (curChIndex === 0) {
                curChIndex = -1;
                isBreak = true;
                break;
            }
        }
        if (isBreak) {
            break;
        } else {
            --curLine;
            if (curLine < 0) {
                break;
            }
            curLineText = doc.lineAt(curLine).text;
            curChIndex = curLineText.length - 1;
        }
    }

    if (!isBreak) {
        return new Position(0, 0);
    } else {
        return new Position(curLine, curChIndex + 1);
    }
}

/**
 * cursor move right by step
 */

export function getNextByNum(doc: TextDocument, pos: Position, step: number = 1): Position {
    if (step < 1) {
        return pos;
    }
    let curLine = pos.line;
    let curCh = pos.character;
    while (true) {
        let lineLength = doc.lineAt(curLine).text.length;
        if (curCh + step > lineLength) {
            step -= (lineLength - curCh + 1);
            ++curLine;
            // the last line
            if (curLine === doc.lineCount) {
                return new Position(--curLine, lineLength);
            }
            curCh = 0;
        } else {
            curCh += step;
            return new Position(curLine, curCh);
        }
    }
}


/**
 * cursor move left by step
 */
export function getPrevByNum(doc: TextDocument, pos: Position, step: number = 1): Position {
    if (step < 1) {
        return pos;
    }

    let curLine = pos.line;
    let curCh = pos.character;
    while (true) {
        if (step > curCh) {
            step -= (curCh + 1);
            --curLine;
            if (curLine < 0) {
                return new Position(0, 0);
            }
            curCh = doc.lineAt(curLine).text.length;
        } else {
            return new Position(curLine, curCh - step);
        }
    }
}

/**
 *  cursor move down
 */
export function getNextByLine(doc: TextDocument, pos: Position, baseColumn: number, step: number = 1): Position {
    if (step < 1) {
        return pos;
    }
    let curLine = pos.line;
    if (step + curLine >= doc.lineCount - 1) {
        curLine = doc.lineCount - 1;
    } else {
        curLine += step;
    }
    let curCh = doc.lineAt(curLine).text.length;
    if (curCh > baseColumn) {
        curCh = baseColumn;
    }
    return new Position(curLine, curCh);
}

/**
 *  cursor move up
 */
export function getPrevByLine(doc: TextDocument, pos: Position, baseColumn: number, step: number = 1): Position {
    if (step < 1) {
        return pos;
    }
    let curLine = pos.line;
    if (curLine - step < 0) {
        curLine = 0;
    } else {
        curLine -= step;
    }
    let curCh = doc.lineAt(curLine).text.length;
    if (curCh > baseColumn) {
        curCh = baseColumn;
    }
    return new Position(curLine, curCh);
}

/**
 *
 * @param doc document
 * @param pos current cursor position
 * @param s char
 */
export function getNextByChar(doc: TextDocument, pos: Position, s: string) {
    let curLine = pos.line;
    let chIndex = pos.character;
    while (curLine <= doc.lineCount - 1) {
        let text = doc.lineAt(curLine).text;
        chIndex = _.findIndex(doc.lineAt(curLine).text, c => {
            return c === s;
        }, chIndex);
        if (chIndex !== -1) {
            break;
        }
        chIndex = 0;
        ++curLine;
    }
    return new Position(curLine, chIndex);
}
