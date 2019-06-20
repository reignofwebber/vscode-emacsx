import { runNativeCommand } from "../runner";
import { Command, registerGlobalCommand } from "../cmd_base";


export function active(extensionPath: string) {

}


@registerGlobalCommand
class CodeQuickOpen extends Command {
    public constructor() {
        super({
            name: 'C-x C-f'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.quickOpen');
    }
}

@registerGlobalCommand
class CodeSplitEditorOrthogonal extends Command {
    public constructor() {
        super({
            name: 'C-x 2'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.splitEditorOrthogonal');
    }
}

@registerGlobalCommand
class CodeSplitEditor extends Command {
    public constructor() {
        super({
            name: 'C-x 3'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.splitEditor');
    }
}

@registerGlobalCommand
class CodeToggleEditorGroupLayout extends Command {
    public constructor() {
        super({
            name: 'C-x 4'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.toggleEditorGroupLayout');
    }
}

@registerGlobalCommand
class CodeFocusNextEditorGroup extends Command {
    public constructor() {
        super({
            name: 'C-x o'
        });
    }

    public async run() {
        runNativeCommand('workbench.action.focusNextGroup');
    }
}
