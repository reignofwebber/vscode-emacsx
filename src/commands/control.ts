import {TextDocument, Position, TextEditor} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerCommand, Command } from "./base";
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
}