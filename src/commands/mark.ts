import { emacs } from "../state";
import { registerCommand, Command } from "./base";

export function active() {

}


@registerCommand
class MarkCommand extends Command {
    name = "C-spc";
    public run(): void {
        emacs.toggleMark();
    }
}