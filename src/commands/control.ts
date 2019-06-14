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


@registerGlobalCommand
class UniversalArgument extends Command {
    name = 'C-u';
    _trace = false;
    repeat: IRepeat = {
        repeatByNumber: false,
        num: 0
    };
    defaultSize: number = 4;

    private command: state.CommandContainer;

    constructor() {
        super();
        this.command = new state.CommandContainer();
    }

    private getValue(): number {
        return this.repeat.repeatByNumber ? this.repeat.num : this.defaultSize ** (this.repeat.num + 1);
    }

    public run(): void {
        this.stayActive = true;
        emacs.updateStatusBar(this.name + '-');
    }

    public push(s: string):boolean {
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

        // parse command
        let c = this.command.push(s, false);
        if (c === 'undefined') {
            this.stayActive = false;
        } else if (c === 'incomplete') {

        } else {
            // command default repeat
            let command = c.command;
            let arg = c.arg;
            switch (command.repeatType) {
                case RepeatType.Default:
                    _.range(this.getValue()).forEach(() => {
                        command.active(arg);
                    });
                    break;
                case RepeatType.Accept:
                    command.active(arg, this.repeat);
                    break;
                case RepeatType.Reject:
                    command.active();
                    break;
            }
            this.stayActive = false;
        }
        return true;
    }

    public deactive() {
        this.repeat.num = 0;
        this.repeat.repeatByNumber = false;
        this.command.clear();
    }
}

// TODO C-u && C-x z
@registerGlobalCommand
class Repeat extends Command {
    name = "C-x z";
    _trace = false;

    public run(): void {
        let c = emacs.commandRing.back();
        if (c) {
            // without active it. ?
            c.run();
            c.stayActive = false;
        }
        this.stayActive = true;
    }

    public push(s: string):boolean {
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
    public run(): void {
        emacs.isReadOnly = !emacs.isReadOnly;
        emacs.updateStatusBar( emacs.isReadOnly? 'Read-Only mode enabled' : 'Read-Only mode disabled');
    }
}