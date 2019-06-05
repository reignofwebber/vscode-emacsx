import { emacs } from "../state";
import { registerGlobalCommand, Command } from "./base";

export function active() {

}


@registerGlobalCommand
class MarkCommand extends Command {
    name = "C-spc";
    public run(): void {
        emacs.toggleMark();
    }
}