import { emacs } from "../state";
import { registerGlobalCommand, Command } from "./base";

export function active() {

}


@registerGlobalCommand
class MarkCommand extends Command {
    name = "C-Spc";
    public run(): void {
        emacs.toggleMark();
    }
}

@registerGlobalCommand
class ExchangePointAndMark extends Command {
    name = 'C-x C-x';
    public run(): void {
        emacs.exchangeMark();
    }
}