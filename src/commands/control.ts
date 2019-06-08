import {TextDocument, Position, TextEditor} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerGlobalCommand, Command, keyMap, CommandState } from "./base";
import * as logic from "./logichelper";

export function active() {

}

@registerGlobalCommand
class KeyboardQuit extends Command {
    name = "C-g";
    public run(): void {
        emacs.updateStatusBar("Quit");
    }
}

@registerGlobalCommand
class CxPrefix extends Command {
    name = "C-x";
    prefix = true;
}

@registerGlobalCommand
class CuPrefix extends Command {
    name = 'C-u';
    prefix = true;
}

@registerGlobalCommand
class Repeat extends Command {
    name = "C-x z";
    trace = false;
    public run(): void {
        let name = emacs.commandRing.back();
        if (name) {
            let c = keyMap[emacs.mode][name];
            if (c && c.command) {
                c.command.start();
                emacs.traceCommand(c.command);
            }
        }

    }
}

@registerGlobalCommand
class ReadOnlyMode extends Command {
    name = 'C-x C-q';
    trace = false;
    public run(): void {
        emacs.isReadOnly = !emacs.isReadOnly;
        emacs.updateStatusBar( emacs.isReadOnly? 'Read-Only mode enabled' : 'Read-Only mode disabled');
    }
}