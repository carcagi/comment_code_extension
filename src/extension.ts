// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';


async function generateComment(codeSnippet: string): Promise<string> {
    let orange = vscode.window.createOutputChannel("Orange");

    const message = `Please return the following code snipped with correct comments:\n\n${codeSnippet}\n`;
   
    const config = vscode.workspace.getConfiguration('carcargi-comment-generator');
    const apiKey = config.get('openaiApiKey');
    vscode.window.showErrorMessage(`The API KEY: ${apiKey}`);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages:  [
            {
                role: "user",
                content: message
            }
        ],
        max_tokens:200,
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.data.choices[0].message.content;
}

async function insertComment() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selection = editor.selection;

    if (selection.isEmpty) {
        vscode.window.showErrorMessage(`Please select the code!`);
        return;
    }
    const codeSnippet = editor.document.getText(selection);

    try {
        const comment = await generateComment(codeSnippet);
        await editor.edit((editBuilder) => {
            editBuilder.replace(selection, `${comment}\n`);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating comment: ${error}`);
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('carcargi-comment-generator.insertComment', insertComment);
    context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
export function deactivate() {}
