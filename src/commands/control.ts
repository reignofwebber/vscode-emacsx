import {TextDocument, Position, TextEditor} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerCommand, Command, commandMap } from "./base";
import * as logic from "./logichelper";

export function active() {

}

@registerCommand
class KeyboardQuit extends Command {
    name = "C-g";
    sequential = true;
}

@registerCommand
class CxPrefix extends Command {
    name = "C-x";
    sequential = true;
    prefix = true;
}

@registerCommand
class Repeat extends Command {
    name = "C-x z";
    trace = false;
    public run(): void {
        let name = emacs.commandRing.back();
        if (name) {
            let c = commandMap[name];
            if (c) {
                c.command.run();
                emacs.traceCommand(c.command);
            }
        }

    }
}