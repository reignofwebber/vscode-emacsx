import { runNativeCommand } from "../runner";
import { Command, registerGlobalCommand } from "../cmd_base";


export function active() {

}

@registerGlobalCommand
class SaveBuffer extends Command {
    public constructor() {
        super({
            name: 'C-x C-s'
        });
    }

    public async run() {
       runNativeCommand('workbench.action.files.save');
    }
}

@registerGlobalCommand
class CodeSaveAllFiles extends Command {
    public constructor() {
        super({
            name: 'C-x s'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.files.saveAll');
    }
}

@registerGlobalCommand
class KillBuffer extends Command {
    public constructor() {
        super({
            name: 'C-x k'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.closeActiveEditor');
    }
}

@registerGlobalCommand
class SaveBuffersKillTerminal extends Command {
    public constructor() {
        super({
            name: 'C-x C-c'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.quit');
    }
}

@registerGlobalCommand
class ToggleZenMode extends Command {
    public constructor() {
        super({
            name: 'C-x C-z'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.toggleZenMode');
    }
}

@registerGlobalCommand
class CommentLine extends Command {
    public constructor() {
        super({
            name: 'C-x C-;',
            modify: true
        });
    }
    public async run() {
        runNativeCommand('editor.action.commentLine');
    }
}

@registerGlobalCommand
class CommentBlock extends Command {
    public constructor() {
        super({
            name: 'C-x ;',
            modify: true
        });
    }
    public async run() {
        runNativeCommand('editor.action.blockComment');
    }
}
