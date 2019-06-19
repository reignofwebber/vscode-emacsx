import * as vscode from "vscode";



export function runNativeCommand(command: string, ...rest: any[]) {
    return vscode.commands.executeCommand(command, ...rest);
}
