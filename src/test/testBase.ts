import * as assert from 'assert';
import { writeFileSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { emacs } from "../emacs";


export interface IContent {
    textArray: string[];
}


export interface IContentCase<T extends IContent> {
    // title of the test
    title: string;
    // content of the editor
    content: T;
    // commandList;
    commands: string[];
    // expect content
    expect: T;
}


export function testContent<T extends IContent>(testInstance: ContentTest, testCase: IContentCase<T>, cb?: () => boolean) {
    test(testCase.title, async () => {
        await testInstance.insertContent(testCase.content).catch(reason => {
            console.log(`insertContent error due to ${reason}`);
        });
        for (let c of testCase.commands) {
            await emacs.command.push(c).catch(reason => {
                console.log(`push command error due to ${reason}`);
            });
        }
        let result = testInstance.retrieveContent();
        assert.ok(testInstance.contentEqual(testCase.expect, result));
        if (cb) {
            assert.ok(cb());
        }
    });
}


export class ContentTest {
    private _file: string;
    /**
     * write test file to disk
     * @param file testFile
     */
    public constructor(file: string) {
        this._file = file;
        writeFileSync(file, '');
    }
    /**
     * insert text to activeEditor
     * @param content text array
     */
    public async insertContent(content: IContent) {
        let doc = await vscode.workspace.openTextDocument(vscode.Uri.file(this._file));
        let editor = await vscode.window.showTextDocument(doc);
        assert.ok(editor, `editor..............................is ${editor}.`);
        let endCh = doc.lineAt(doc.lineCount - 1).text.length;
        let startPos = new vscode.Position(0, 0);
        let endPos = new vscode.Position(doc.lineCount - 1, endCh);

        // replace old content
        await editor!.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(startPos, endPos), content.textArray.join('\n'));
        });

        // do some other initialization like active or anchor position.
    }

    /**
     * get content from activeEditor
     */
    public retrieveContent(): IContent {
        let editor = vscode.window.activeTextEditor;
        assert.ok(editor);
        // retrieve text
        let doc = editor!.document;
        let text: string[] = [];
        let curLine = 0;
        while (curLine !== doc.lineCount) {
            text.push(doc.lineAt(curLine).text);
            ++curLine;
        }

        return {
            textArray: text
        };
    }

    /**
     * compare two content
     * @param l left side
     * @param r right side
     */
    public contentEqual(l: IContent, r: IContent) {
        if (l.textArray.length !== r.textArray.length) {
            console.log("content:not equal -->");
            console.log(l.textArray);
            console.log(r.textArray);
            return false;
        }
        // compare strings in arrsy
        for (let i = 0; i < l.textArray.length; ++i) {
            if (l.textArray[i] !== r.textArray[i]) {
                console.log("content:not equal -->");
                console.log(l.textArray);
                console.log(r.textArray);
                return false;
            }
        }
        return true;
    }

    file () {
        return this._file;
    }
}



export function getFileName(f: string) {
    let name = path.basename(f);
    return name.split('.')[0];
}
