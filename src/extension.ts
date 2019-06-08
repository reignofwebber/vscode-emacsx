// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { emacs } from './state';
import { dispatchCommand } from './runner';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const packagejson: {
		contributes: {
			keybindings: VSCodeKeybinding[]
		};
	} = require('../package.json');

	interface VSCodeKeybinding {
		key: string;
		mac?: string;
		linux?: string;
		command: string;
		when: string;
	}

	for (let keybinding of packagejson.contributes.keybindings) {
		context.subscriptions.push(vscode.commands.registerCommand(keybinding.command, () => {
			dispatchCommand(keybinding.command);
		}));
	}
	context.subscriptions.push(vscode.commands.registerCommand("type", (arg) => {
		if (!emacs.type(arg.text)) {
			vscode.commands.executeCommand('default:type', {
				text: arg.text
			});
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
