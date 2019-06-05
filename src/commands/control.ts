import {TextDocument, Position, TextEditor} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerGlobalCommand, Command, keyMap } from "./base";
import * as logic from "./logichelper";

export function active() {

}

@registerGlobalCommand
class KeyboardQuit extends Command {
    name = "C-g";
    sequential = true;
    public run(): void {
        emacs.updateStatusBar("Quit");
    }
}

@registerGlobalCommand
class CxPrefix extends Command {
    name = "C-x";
    sequential = true;
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
            if (c) {
                c.command.run();
                emacs.traceCommand(c.command);
            }
        }

    }
}