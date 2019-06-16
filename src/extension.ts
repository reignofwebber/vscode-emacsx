// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { emacs } from './state';

// active commands
import * as motions from "./commands/motions";
import * as mark from "./commands/mark";
import * as edit from "./commands/edit";
import * as control from "./commands/control";
import * as file from "./commands/file";
import * as extend from "./commands/extend";
import { useExtendCommand } from './configure';




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// active
	motions.active();
	mark.active();
	edit.active();
	control.active();
	file.active();
	if (useExtendCommand) {
		extend.active(context.extensionPath);
	}

	const packagejson: {
		contributes: {
			keybindings: VSCodeKeybinding[]
		};
	} = require('../package.json');

	interface VSCodeKeybinding {
		key: string;
		mac?: string;
		linux?: string;
		native?: boolean;
		command: string;
		when: string;
	}

	for (let keybinding of packagejson.contributes.keybindings) {
		if (!keybinding.native) {
			context.subscriptions.push(vscode.commands.registerCommand(keybinding.command, () => {
				emacs.command.push(keybinding.command);
			}));
		}
	}
	context.subscriptions.push(vscode.commands.registerCommand("type", (arg) => {
		emacs.command.push(arg.text);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
