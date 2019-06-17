import {TextDocument, Position, TextEditor, commands} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { wordSeparators } from "../configure";
import { registerGlobalCommand, Command, keyMap, RepeatType, IRepeat } from "./base";
import * as logic from "./logichelper";
import _ = require("lodash");
import state = require('../state');

export function active() {

}

enum ParseState{
    Argument,
    Command
}

@registerGlobalCommand
class UniversalArgument extends Command {
    name = 'C-u';
    _trace = false;
    repeat: IRepeat = {
        repeatByNumber: false,
        num: 0
    };

    parseState: ParseState;
    defaultSize: number = 4;

    private command: state.CommandContainer;

    constructor() {
        super();
        this.command = new state.CommandContainer();
        this.parseState = ParseState.Argument;
    }

    private getValue(): number {
        return this.repeat.repeatByNumber ? this.repeat.num : this.defaultSize ** (this.repeat.num + 1);
    }

    public async run() {
        this.stayActive = true;
        emacs.updateStatusBar(this.name + '-');
    }

    public async push(s: string): Promise<boolean> {
        // parse argument stage.
        if (this.parseState === ParseState.Argument) {
            // parse argument
            if (s === 'C-u' && !this.repeat.repeatByNumber) {
                ++this.repeat.num;
                emacs.updateStatusBar(this.name, true);
                return true;
            } else if (/^[0-9]$/.exec(s)) {
                this.repeat.repeatByNumber = true;
                this.repeat.num *= 10;
                this.repeat.num += Number.parseInt(s);
                emacs.updateStatusBar(this.name + ' ' + this.repeat.num.toString() + '-');
                return true;
            }
        }
        // parse command stage.
        this.parseState = ParseState.Command;

        // parse command
        let c = await this.command.push(s, false);


        if (c === 'undefined') {
            this.stayActive = false;
        } else if (c === 'incomplete') {
            if (!this.command.isActive) {
                this.stayActive = false;
            }
        } else {
            // command default repeat
            let command = c.command;
            let args: any[] = [];
            if (c.arg) {
                args.push(c.arg);
            }

            switch (command.repeatType) {
                case RepeatType.Loop:
                    // ineffeciently FIXME
                    await _.range(this.getValue()).forEach(async () => {
                        await command.repeatRun();
                    });
                    break;
                case RepeatType.Accept:
                    args.push(this.repeat);
                    await command.active(...args);
                    break;
                case RepeatType.Reject:
                    await command.active();
                    break;
            }
            // curCommand don't need `push`
            if (!this.command.isActive) {
                this.stayActive = false;
            }
        }
        return true;
    }

    public deactive() {
        this.repeat.num = 0;
        this.repeat.repeatByNumber = false;
        this.command.clear();
        this.parseState = ParseState.Argument;

    }
}

// TODO C-u && C-x z
@registerGlobalCommand
class Repeat extends Command {
    name = "C-x z";
    _trace = false;

    public async run() {
        let c = emacs.commandRing.back();
        if (c) {
            // without active it. ?
            c.repeatRun();
            // if c is not Active, then following `z` will active.
            if (!c.isActive) {
                this.stayActive = true;
            }
        }

    }

    public async push(s: string): Promise<boolean> {
        if (s === 'z') {
            this.run();
            return true;
        } else {
            this.stayActive = false;
            return false;
        }
    }
}

// TODO
@registerGlobalCommand
class ReadOnlyMode extends Command {
    name = 'C-x C-q';
    _trace = false;
    public async run() {
        emacs.isReadOnly = !emacs.isReadOnly;
        emacs.updateStatusBar( emacs.isReadOnly? 'Read-Only mode enabled' : 'Read-Only mode disabled');
    }
}