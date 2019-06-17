import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command } from "./base";
import * as logic from "./logichelper";
import { start } from "repl";


export function active(extensionPath: string) {

}


@registerGlobalCommand
class CodeQuickOpen extends Command {
    name = 'C-x C-f';
    public async run() {
        runNativeCommand('workbench.action.quickOpen');
    }
}

@registerGlobalCommand
class CodeSplitEditorOrthogonal extends Command {
    name = 'C-x 2';
    public async run() {
        runNativeCommand('workbench.action.splitEditorOrthogonal');
    }
}

@registerGlobalCommand
class CodeSplitEditor extends Command {
    name = 'C-x 3';
    public async run() {
        runNativeCommand('workbench.action.splitEditor');
    }
}

@registerGlobalCommand
class CodeToggleEditorGroupLayout extends Command {
    name = 'C-x 4';
    public async run() {
        runNativeCommand('workbench.action.toggleEditorGroupLayout');
    }
}

@registerGlobalCommand
class CodeFocusNextEditorGroup extends Command {
    name = 'C-x o';
    public async run() {
        runNativeCommand('workbench.action.focusNextGroup');
    }
}
