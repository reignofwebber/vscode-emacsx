import {TextDocument, Position} from "vscode";
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
        return new Position(curLine, curChIndex);
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

export function getNextPos(doc: TextDocument, pos: Position): Position {
    if (doc.lineAt(pos.line).text.length > pos.character) {
        return new Position(pos.line, pos.character + 1);
    } else if (doc.lineCount - 1 > pos.line) {
        return new Position(pos.line + 1, 0);
    } else {
        return pos;
    }
}

export function getPrevPos(doc: TextDocument, pos: Position): Position {
    if (pos.character > 0) {
        return new Position(pos.line, pos.character - 1);
    } else if (pos.line > 0) {
        return new Position(pos.line - 1, 0);
    } else {
        return pos;
    }
}

/**
 *
 * @param doc document
 * @param pos current cursor position
 * @param s char
 */
export function getNextChar(doc: TextDocument, pos: Position, s: string) {
    let curLine = pos.line;
    let c = pos.character;
    while (curLine <= doc.lineCount - 1) {
        c = _.findIndex(doc.lineAt(curLine).text, c => {
            return c === s;
        }, c + 1);
        if (c !== -1) {
            break;
        }
        c = -1;
        ++curLine;
    }
    return new Position(curLine, c);
}
