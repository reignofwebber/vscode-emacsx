import { emacs } from "../state";
import { runNativeCommand } from "../runner";


export enum Mode {
    Global,
    Fundemental
}

type KeyBinding = {
    [key: string]: Command
};

export let keyMap: {
    [key: string]: KeyBinding
} = {
    [Mode.Global] : {}
};

export interface IRepeat {
    num: number;
    repeatByNumber: boolean;
}

export enum RepeatType {
    // repeat active command, ineffeciently
    Loop,
    // repeat as argument run(arg)
    Accept,
    // not support repeat
    Reject,
}


export interface ICommand {
    command: Command;
    arg?: any;
}

@registerGlobalCommand
export class Command {
    // name of Command
    name: string = "__nothing__";
    // trace (if emacs trace this command name)
    _trace: boolean = true;
    // if change text
    change: boolean = false;
    // repeat type
    repeatType: RepeatType = RepeatType.Reject;
    // if need followed command, (true is active)
    private _state: boolean = false;
    // if stay state, if true, active() will not set InActive state.
    private _stayActive: boolean = false;

    // must override push() method to deactive command
    public set stayActive(s: boolean) {
        this._stayActive = s;
        if (!s) {
            this._state = false;
            this.deactive();
        }
    }

    get isActive() {
        return this._state;
    }

    public active(...arg: any[]): void {
        if (this.runCheck(...arg)) {
            this._state = true;
            this.run(...arg);
            if (!this._stayActive) {
                this._state = false;
                this.deactive();
            }

            if (this._trace) {
                emacs.traceCommand(this);
            }
        }
    }

    /**
     * before run command. need some environment satisfied.
     */
    public runCheck(...arg: any[]): boolean {
        // command is changable but editor is readonly
        if (this.change && emacs.isReadOnly) {
            return false;
        }
        return true;
    }

    /**
     * command run
     */
    public run(...arg: any[]): void {

    }

    /**
     * repeat behavior, used by `C-u` or `C-x z`
     */
    public repeatRun() {

    }

    /**
     * push() override for active command
     * @param arg push override
     * @return accept or reject arg
     */
    public push(arg: string):boolean {
        return false;
    }

    /**
     * clean
     */
    public deactive() {

    }
}

export abstract class RepeatableCommand extends Command {
    repeatType = RepeatType.Accept;

    protected repeatNum = 1;

    public deactive() {
        this.repeatNum = 1;
    }
}

export function registerGlobalCommand(command: typeof Command) {
    let c = new command();
    keyMap[Mode.Global][c.name] = c;
}

@registerGlobalCommand
class KeyboardQuit extends Command {
    name = "C-g";
    public run(): void {
        emacs.command.clear();
        emacs.updateStatusBar("Quit");
    }
}

@registerGlobalCommand
class DefaultType extends Command {
    name = '__default:type__';
    change = true;
    repeatType = RepeatType.Accept;
    public run(c: string, repeat?: IRepeat): void {
        let r = repeat ? repeat.repeatByNumber ? repeat.num : 4 ** (repeat.num + 1) : 1;
        runNativeCommand('default:type', {
            text: c.repeat(r)
		});
    }
}

@registerGlobalCommand
class DeleteLeft extends Command {
    name = '__Del__';
    change = true;
    public run(c: string): void {
        runNativeCommand('deleteLeft');
    }
}
