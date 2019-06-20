import { getRepeatNum } from "./configure";
import { emacs } from "./emacs";
import { IRepeat, Mode, ICmdConfig } from "./global";
import { runNativeCommand } from "./runner";


export interface ICommand {
    command: Command;
    arg?: any;
}

type KeyBinding = {
    [key: string]: Command
};

export let keyMap: {
    [key: string]: KeyBinding
} = {
    [Mode.Global] : {}
};


export abstract class Command {
    // configurable properties
    // name of Command
    private _name: string = "";
    // trace (if emacs trace this command name)
    private _trace: boolean = true;
    // if change text
    private _modify: boolean = false;
    // default repeat num
    protected repeatNum = 1;

    private _state: boolean = false;
    // if stay state, if true, active() will not set InActive state.
    private _stayActive: boolean = false;

    public constructor(config: ICmdConfig) {
        // configurable properties
        this._name = config.name;
        this._trace = config.trace === undefined ? true : config.trace;
        this._modify = config.modify === undefined ? false: config.modify;
        //
        // if need followed command, (true is active)
        this._state = false;
    }

    get name () {
        return this._name;
    }

    get trace() {
        return this._trace;
    }

    set trace(t: boolean) {
        this._trace = t;
    }

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

    public async active(...arg: any[]): Promise<void> {
        if (this.runCheck(...arg)) {
            this._state = true;
            await this.run(...arg);
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
        if (this._modify && emacs.isReadOnly) {
            return false;
        }
        return true;
    }

    /**
     * command run
     */
    public async run(...arg: any[]) {

    }

    /**
     * repeat behavior, used by `C-u` or `C-x z`
     */
    public async repeatRun() {

    }

    /**
     * push() override for active command
     * @param arg push override
     * @return accept or reject arg
     */
    public async push(arg: string):Promise<boolean> {
        return false;
    }

    /**
     * clean
     */
    public deactive() {

    }
}

@registerGlobalCommand
export class Nothing extends Command {
    public constructor() {
        super({
            name: "__nothing__"
        });
    }
}

export abstract class RepeatableCommand extends Command {

}

export function registerGlobalCommand(command: new (...args:any[]) => Command) {
    let c = new command();
    keyMap[Mode.Global][c.name] = c;
}

//////////////////////////////////////////////////////////////////
// commands below will be preloaded
//////////////////////////////////////////////////////////////////

@registerGlobalCommand
class KeyboardQuit extends Command {
    public constructor() {
        super({
            name: 'C-g'
        });
    }

    public async run() {
        emacs.command.clear();
        emacs.updateStatusBar("Quit");
    }
}

@registerGlobalCommand
class DefaultType extends Command {
    public constructor() {
        super({
            name: '__default:type__',
            modify: true
        });
    }
    public async run(c: string, repeat?: IRepeat) {
        runNativeCommand('default:type', {
            text: c.repeat(getRepeatNum(repeat))
		});
    }
}

@registerGlobalCommand
class DeleteLeft extends Command {
    public constructor() {
        super({
            name: '__Del__',
            modify: true
        });
    }

    public async run(c: string) {
        runNativeCommand('deleteLeft');
    }
}
