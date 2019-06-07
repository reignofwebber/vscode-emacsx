import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command } from "./base";
import * as logic from "./logichelper";
import { start } from "repl";


export function active() {

}

@registerGlobalCommand
class SaveBuffer extends Command {
    name = 'C-x C-s';
    public run(): void {
        let doc = emacs.editor.doc;
        if (doc) {
            doc.save();
        }
    }
}

@registerGlobalCommand
class KillBuffer extends Command {
    name = 'C-x k';
    public run(): void {
        runNativeCommand('workbench.action.closeActiveEditor');
    }
}

@registerGlobalCommand
class SaveBuffersKillTerminal extends Command {
    name = 'C-x C-c';
    public run(): void {
        runNativeCommand('workbench.action.quit');
    }
}