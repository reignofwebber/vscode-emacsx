import * as vscode from "vscode";


export function runNativeCommand(command: string, ...rest: any[]) {
    vscode.commands.executeCommand(command, ...rest);
}
