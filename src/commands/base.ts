import { emacs } from "../state";
import { useExtendCommand } from "../configure";


export enum Mode {
    Fundemental = 'Fundemental',
    Global = 'Global'
}

type KeyBinding = {
    [key: string]: ICommand
};

export let keyMap: {
    [key: string]: KeyBinding
} = {
    [Mode.Global] : {}
};

export enum CommandState {
    UnDefined,
    InCompete,
    Well
};

export interface ICommand {
    state: CommandState;
    command: Command;
}

export class Command {
    // name of Command
    name: string = "";
    // is prefix e.g. C-u C-x
    prefix: boolean = false;
    // trace
    trace: boolean = true;

    public run(): void {

    }
}

export function registerGlobalCommand(command: typeof Command) {
    let c = new command();
    keyMap[Mode.Global][c.name] = {
        state: CommandState.Well,
        command: c
    };
}

// active commands

import * as motions from "./motions";
import * as mark from "./mark";
import * as edit from "./edit";
import * as control from "./control";
import * as file from "./file";
import * as extend from "./extend";


motions.active();
mark.active();
edit.active();
control.active();
file.active();
if (useExtendCommand) {
    extend.active();
}
