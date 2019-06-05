import * as vscode from "vscode";
import { emacs } from "./state";


export function runNativeCommand(command: string, ...rest: any[]) {
    vscode.commands.executeCommand(command, ...rest);
}

export function dispatchCommand(command: string) {
    let c = emacs.command.push(command);
    if (c) {
        c.run();
        emacs.traceCommand(c);
    }
}