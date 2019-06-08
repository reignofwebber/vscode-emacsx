import { emacs } from "../state";
import { registerGlobalCommand, Command, IRepeat } from "./base";


export function active() {

}


@registerGlobalCommand
class MarkCommand extends Command {
    name = "C-Spc";
    cuPrefix = true;
    public runWithRepeat(repeat: IRepeat | undefined): void {
        if (repeat && repeat.num) {
            let pos = emacs.markRing.rolling();
            if (pos) {
                emacs.setCurrentPosition(pos);
            }
        } else {
            emacs.toggleMark();
        }
    }
}

@registerGlobalCommand
class ExchangePointAndMark extends Command {
    name = 'C-x C-x';
    public run(): void {
        emacs.exchangeMark();
    }
}

@registerGlobalCommand
class PopGlobalMark extends Command {
    name = 'C-x C-Spc';
    public run(): void {
        emacs.markRing.clear();
    }
}

