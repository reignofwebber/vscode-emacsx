import * as vscode from "vscode";
import { emacs } from "./state";
import { ICommand, Command, keyMap, Mode } from "./commands/base";
import { repeatInitNumber } from "./configure";



export function runNativeCommand(command: string, ...rest: any[]) {
    vscode.commands.executeCommand(command, ...rest);
}
