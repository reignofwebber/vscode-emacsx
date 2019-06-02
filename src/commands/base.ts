import { emacs } from "../state";

export let commandMap: {
    [key: string]: ICommand
} = {};

interface ICommand {
    isComposed: boolean;
    command: Command;
}

export class Command {
    // name of Command
    name: string = "";
    // command's name is subset of some other commands
    sequential: boolean = false;
    // is prefix e.g. C-u C-x
    prefix: boolean = false;
    // trace
    trace: boolean = true;

    public runWrap(): void {
        let c: this | Command | undefined = this;
        if (this.sequential) {
            c = emacs.command.push(this.name);
        }
        if (c) {
            c.run();
            emacs.traceCommand(this);
        }
    }

    public run(): void {

    }
}

export function registerCommand(command: typeof Command) {
    let c = new command();
    let isComposed = c.name.split(' ').length !== 1;
    commandMap[c.name] = {
        isComposed: isComposed,
        command: c
    };
}

// active commands

import * as motions from "./motions";
import * as mark from "./mark";
import * as edit from "./edit";
import * as control from "./control";


motions.active();
mark.active();
edit.active();
control.active();
