import * as vscode from "vscode";
import { emacs } from "./state";
import { CommandState } from "./commands/base";


export function runNativeCommand(command: string, ...rest: any[]) {
    vscode.commands.executeCommand(command, ...rest);
}

export function dispatchCommand(command: string) {
    let c = emacs.command.push(command);
    if (c.state === CommandState.Well) {
        c.command.run();
        emacs.traceCommand(c.command);
    }
}