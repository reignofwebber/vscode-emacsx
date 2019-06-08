import * as vscode from "vscode";
import { emacs } from "./state";
import { CommandState } from "./commands/base";
import { repeatInitNumber } from "./configure";


export function runNativeCommand(command: string, ...rest: any[]) {
    vscode.commands.executeCommand(command, ...rest);
}

export function dispatchCommand(command: string) {
    let c = emacs.command.push(command);
    if (c.state === CommandState.Well) {
        if (c.command!.cuPrefix) {
            c.command!.runWithRepeat(c.repeat);            
        } else {
            let repeat = c.repeat ? c.repeat.repeatByNumber ? c.repeat.num : repeatInitNumber ** c.repeat.num : 1;
            repeat = repeat || 1;
            for (let i = 0; i < repeat; ++i) {
                c.command!.start();
            }
        }

        emacs.traceCommand(c.command);
    }
}