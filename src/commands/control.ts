import { getRepeatNum } from "../configure";
import { CommandContainer, emacs } from "../emacs";
import { IRepeat } from "../global";
import { Command, registerGlobalCommand } from "../cmd_base";
import _ = require("lodash");

export function active() {

}

enum ParseState{
    Argument,
    Command
}

@registerGlobalCommand
class UniversalArgument extends Command {
    repeat: IRepeat = {
        repeatByNumber: false,
        num: 0
    };

    parseState: ParseState;

    private command: CommandContainer;

    public constructor() {
        super({
            name: 'C-u',
            trace: false
        });
        this.command = new CommandContainer();
        this.parseState = ParseState.Argument;
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

            args.push(this.repeat);
            await command.active(...args);
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

@registerGlobalCommand
class Repeat extends Command {
    public constructor() {
        super({
            name: 'C-x z',
            trace: false
        });
    }

    public async run() {
        let c = emacs.commandRing.back();
        if (c) {
            // without active it. ?
            await c.repeatRun();
            // if c is not Active, then following `z` will active.
            if (!c.isActive) {
                this.stayActive = true;
            }
        }

    }

    public async push(s: string): Promise<boolean> {
        if (s === 'z') {
            await this.run();
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
    public constructor() {
        super({
            name: 'C-x C-q',
            trace: false
        });
    }

    public async run() {
        emacs.isReadOnly = !emacs.isReadOnly;
        emacs.updateStatusBar( emacs.isReadOnly? 'Read-Only mode enabled' : 'Read-Only mode disabled');
    }
}
