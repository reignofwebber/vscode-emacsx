// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commandMap } from "./commands/base";
import { emacs } from './state';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	for (let command in commandMap) {
		context.subscriptions.push(vscode.commands.registerCommand(command, () => {
			let c = commandMap[command];
			if (!c.isComposed) {
				c.command.runWrap();
			}
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
