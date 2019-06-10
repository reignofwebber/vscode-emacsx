import {TextDocument, Position, TextEditor, Range, DocumentHighlight, Selection} from "vscode";
import { emacs } from "../state";
import { runNativeCommand } from "../runner";
import { registerGlobalCommand, Command, RepeatType } from "./base";
import * as logic from "./logichelper";
import { start } from "repl";


export function active() {

}

@registerGlobalCommand
class SaveBuffer extends Command {
    name = 'C-x C-s';
    public run(): void {
        let doc = emacs.editor.doc;
        if (doc) {
            doc.save();
        }
    }
}

@registerGlobalCommand
class CodeSaveAllFiles extends Command {
    name = 'C-x s';
    public run(): void {
        runNativeCommand('workbench.action.files.saveAll');
    }
}

@registerGlobalCommand
class KillBuffer extends Command {
    name = 'C-x k';
    public run(): void {
        runNativeCommand('workbench.action.closeActiveEditor');
    }
}

@registerGlobalCommand
class SaveBuffersKillTerminal extends Command {
    name = 'C-x C-c';
    repeatType = RepeatType.Reject;
    public run(): void {
        runNativeCommand('workbench.action.quit');
    }
}

@registerGlobalCommand
class ToggleZenMode extends Command {
    name = 'C-x C-z';
    repeatType = RepeatType.Reject;
    public run(): void {
        runNativeCommand('workbench.action.toggleZenMode');
    }
}

@registerGlobalCommand
class CommentLine extends Command {
    name = 'C-x C-;';
    change = true;
    repeatType = RepeatType.Reject;
    public run(): void {
        runNativeCommand('editor.action.commentLine');
    }
}

@registerGlobalCommand
class CommentBlock extends Command {
    name = 'C-x ;';
    change = true;
    repeatType = RepeatType.Reject;
    public run(): void {
        runNativeCommand('editor.action.blockComment');
    }
}
