import * as vscode from 'vscode';
import { Items } from './types/Items';

export function activate(context: vscode.ExtensionContext) {
    console.log('The SPT Dev extension is now active.');

    // Load initial configuration options
    let configuration = vscode.workspace.getConfiguration('spt-dev');
    let language = configuration.get('language', 'en');
    let nameType = configuration.get('nameType', 'Name');

    // Load the appropriate language file based on the setting
    let itemsData: Items = require(`./database/${language}.json`);

    let activeEditor = vscode.window.activeTextEditor;

    const decorationType = vscode.window.createTextEditorDecorationType({
        fontStyle: 'italic',
        textDecoration: 'underline'
    });

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        const text = activeEditor.document.getText();
        const matchRanges: vscode.Range[] = [];

        for (const id in itemsData) {
            let matchIndex = text.indexOf(id);
            while (matchIndex !== -1) { // Loop to find all occurrences
                const startPos = activeEditor.document.positionAt(matchIndex);
                const endPos = activeEditor.document.positionAt(matchIndex + id.length);
                const range = new vscode.Range(startPos, endPos);
                matchRanges.push(range);

                // Continue searching from the end of the last found occurrence
                matchIndex = text.indexOf(id, matchIndex + id.length);
            }
        }

        // Apply the decoration to the ranges where matches were found
        activeEditor.setDecorations(decorationType, matchRanges);
    }

    if (activeEditor) {
        updateDecorations();
    }

    // Register a listener for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('spt-dev.language')) {
            // Update the language setting and reload the language file
            configuration = vscode.workspace.getConfiguration('spt-dev');
            language = configuration.get('language', 'en');
            itemsData = require(`./database/${language}.json`);

            // You might want to update decorations here as well
            updateDecorations();
        }
        if (e.affectsConfiguration('spt-dev.nameType')) {
            // Update the name type setting
            configuration = vscode.workspace.getConfiguration('spt-dev');
            nameType = configuration.get('nameType', 'Name');
        }
    }));

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    const hoverProvider = vscode.languages.registerHoverProvider('typescript', {
        provideHover(document, position, token) {
            const word = document.getText(document.getWordRangeAtPosition(position));
            const itemData = itemsData[word]; // Access the data using the word as a key
            let hoverText = '';
            if (itemData && (nameType === 'Name' || nameType === 'ShortName')) {
                hoverText = itemData[nameType]; // Retrieve the Name or ShortName based on user setting
            }

            if (hoverText) {
                return new vscode.Hover(hoverText);
            }
        }
    });

    context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
