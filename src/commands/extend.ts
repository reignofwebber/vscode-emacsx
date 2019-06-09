import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command } from "./base";
import * as logic from "./logichelper";
import { start } from "repl";


export function active() {

}

@registerGlobalCommand
class CodeNextEditor extends Command {
    name = 'M-]';
    public run(): void {
        runNativeCommand('workbench.action.nextEditor');
    }
}

@registerGlobalCommand
class CodePreviousEditor extends Command {
    name = 'M-[';
    public run(): void {
        runNativeCommand('workbench.action.previousEditor');
    }
}

@registerGlobalCommand 
class CodeMoveLinesDown extends Command {
    name = 'C-S-n';
    public run(): void {
        runNativeCommand('editor.action.moveLinesDownAction');
    }
}

@registerGlobalCommand 
class CodeMoveLinesUp extends Command {
    name = 'C-S-p';
    public run(): void {
        runNativeCommand('editor.action.moveLinesUpAction');
    }
}

@registerGlobalCommand 
class CodeCopyLinesDown extends Command {
    name = 'M-S-n';
    public run(): void {
        runNativeCommand('editor.action.copyLinesDownAction');
    }
}

@registerGlobalCommand 
class CodeCopyLinesUp extends Command {
    name = 'M-S-p';
    public run(): void {
        runNativeCommand('editor.action.copyLinesUpAction');
    }
}

@registerGlobalCommand 
class Code extends Command {
    name = 'M-x';
    public run(): void {
        runNativeCommand('workbench.action.showCommands');
    }
}

@registerGlobalCommand
class CodeExpandSelection extends Command {
    name = 'C-h';
    public run(): void {
        runNativeCommand('editor.action.smartSelect.expand');
    }
}

@registerGlobalCommand
class CodeShrinkSelection extends Command {
    name = 'M-h';
    public run(): void {
        runNativeCommand('editor.action.smartSelect.shrink');
    }
}

@registerGlobalCommand
class CodeFind extends Command {
    name = 'C-M-f';
    public run(): void {
        runNativeCommand('actions.find');
    }

}