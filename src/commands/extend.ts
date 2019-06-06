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