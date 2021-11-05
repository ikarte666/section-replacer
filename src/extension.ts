import * as vscode from "vscode";

const logChannel = vscode.window.createOutputChannel("debug");

function log(msg: string) {
    logChannel.appendLine(msg);
    logChannel.show();
} // 로그용 함수

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "section-replacer.sectionReplace",
        () => {
            vscode.window
                .showInputBox({
                    prompt: "Input the text you want to change. If you want to change foo to bar, ex) foo:::bar",
                    title: "Replace",
                })
                .then((value) => {
                    const inputString = String(value);
                    if (inputString === undefined || inputString === "") {
                        vscode.window.showInformationMessage(
                            "Please input correct value",
                        );
                        return;
                    }

                    const changeString: string[] = inputString.split(":::");
                    const currentTextEditor = vscode.window.activeTextEditor;
                    if (!currentTextEditor) {
                        return;
                    }
                    const currentTextDocument = currentTextEditor.document;
                    const selections = currentTextEditor.selections;
                    const selectionRange = new vscode.Range(
                        selections[0].start,
                        selections[0].end,
                    );
                    const lineAndChar: any = [];
                    let lines = currentTextDocument
                        .getText(selectionRange)
                        .split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        for (let j = 0; j < lines[i].length; ) {
                            const char = lines[i].indexOf(changeString[0], j);
                            if (char > -1) {
                                lineAndChar.push({ line: i, char });
                                j = char + 1;
                            } else {
                                j++;
                            }
                        }
                    }
                    currentTextEditor.edit((editBuilder) => {
                        for (let i = 0; i < lineAndChar.length; i++) {
                            let sPos = new vscode.Position(
                                lineAndChar[i].line,
                                lineAndChar[i].char,
                            );
                            let ePos = new vscode.Position(
                                lineAndChar[i].line,
                                lineAndChar[i].char + changeString[0].length,
                            );
                            let range = new vscode.Range(sPos, ePos);
                            editBuilder.replace(range, changeString[1]);
                        }
                    });
                });
        },
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
