import * as vscode from "vscode";
import { ItemDetailType, ItemDetails, Items } from "./types/Items";

export function activate(context: vscode.ExtensionContext) {
    console.log("The SPT Dev extension is now active.");

    const loadItemsData = (lang: string): Items => {
        try {
            return require(`./database/${lang}.json`);
        } catch (error) {
            console.error(`Failed to load language file: ${lang}.json`, error);
            vscode.window.showErrorMessage(`Failed to load language data for ${lang}. Falling back to English.`);
            return require("./database/en.json"); // Fallback to English
        }
    };

    let configuration = vscode.workspace.getConfiguration("spt-dev");
    let language = configuration.get("language", "en");
    let nameType = configuration.get("nameType", "Name");
    let itemsData: Items = loadItemsData(language);

    const decorationType = vscode.window.createTextEditorDecorationType({
        fontStyle: "italic",
        textDecoration: "underline",
    });

    let activeEditor = vscode.window.activeTextEditor;

    const updateDecorations = () => {
        if (!activeEditor) {
            return;
        }

        const text = activeEditor.document.getText();
        const decorations: vscode.DecorationOptions[] = [];

        for (const id in itemsData) {
            let matchIndex = text.indexOf(id);
            while (matchIndex !== -1) {
                const startPos = activeEditor.document.positionAt(matchIndex);
                const endPos = activeEditor.document.positionAt(matchIndex + id.length);
                const range = new vscode.Range(startPos, endPos);
                decorations.push({ range });

                matchIndex = text.indexOf(id, matchIndex + id.length);
            }
        }

        activeEditor.setDecorations(decorationType, decorations);
    };

    if (activeEditor) {
        updateDecorations();
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("spt-dev.language")) {
                configuration = vscode.workspace.getConfiguration("spt-dev");
                language = configuration.get("language", "en");
                itemsData = loadItemsData(language);
                updateDecorations();
            }
            if (e.affectsConfiguration("spt-dev.nameType")) {
                configuration = vscode.workspace.getConfiguration("spt-dev");
                nameType = configuration.get("nameType", "Name");
            }
        }),
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            activeEditor = editor;
            if (editor) {
                updateDecorations();
            }
        }),
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (activeEditor && event.document === activeEditor.document) {
                updateDecorations();
            }
        }),
        vscode.languages.registerHoverProvider(["typescript", "json"], {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return;
                }
                const word = document.getText(wordRange);
                const itemData = itemsData[word];

                if (itemData) {
                    return new vscode.Hover(createHoverContent(itemData));
                }
            },
        }),
    );
}

function createHoverContent(item: ItemDetails): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.supportHtml = true;

    let header = `<h3>${item.Name}`;
    if (item.Name !== item.ShortName) {
        header += ` [<em>${item.ShortName}</em>]`;
    }
    header += "</h3>";
    md.appendMarkdown(header);

    md.appendMarkdown("<pre>");
    appendValueIfDefined(md, "Type", item.Type);

    if (typeof item.Parent !== "undefined" && typeof item.ParentID !== "undefined") {
        md.appendMarkdown(`Parent: ${item.Parent} - <a href="${item.ParentDetailLink}">${item.ParentID}</a>\n`);
    }

    if (item.Type === ItemDetailType.AMMO) {
        appendValueIfDefined(md, "Caliber", item.Caliber);
        appendValueIfDefined(md, "Damage", item.Damage);
        appendValueIfDefined(md, "Armor Damage", item.ArmorDamage);
        appendValueIfDefined(md, "Penetration Power", item.PenetrationPower);
    }

    if (item.Type === ItemDetailType.CUSTOMIZATION) {
        appendValueIfDefined(md, "Description", item.Description);
        appendValueIfDefined(md, "Body Part", item.BodyPart);
        appendValueIfDefined(md, "Sides", item.Sides);
        appendValueIfDefined(md, "Integrated Armor", item.IntegratedArmorVest);
        appendValueIfDefined(md, "Available By Default", item.AvailableAsDefault);
        appendValueIfDefined(md, "Prefab Path", item.PrefabPath);
    }

    if (item.Type === ItemDetailType.LOCATION) {
        appendValueIfDefined(md, "Map ID", item.Id);
        appendValueIfDefined(md, "Airdrop Chance", item.AirdropChance);
        appendValueIfDefined(md, "Time Limit", item.EscapeTimeLimit);
        appendValueIfDefined(md, "Insurance", item.Insurance);
        appendValueIfDefined(md, "Boss Spawns", item.BossSpawns);
    }

    if (item.Type === ItemDetailType.QUEST) {
        if (typeof item.Trader !== "undefined" && typeof item.TraderId !== "undefined") {
            md.appendMarkdown(`Trader: ${item.Trader} - <a href="${item.TraderLink}">${item.TraderId}</a>\n`);
        } else {
            appendValueIfDefined(md, "Trader ID", item.TraderId);
        }
        appendValueIfDefined(md, "Quest Type", item.QuestType);
    }

    appendValueIfDefined(md, "Weight", item.Weight);
    appendValueIfDefined(md, "Flea Blacklisted", item.FleaBlacklisted);
    appendValueIfDefined(md, "Unlocked By Default", item.UnlockedByDefault);

    md.appendMarkdown("</pre>");

    if (typeof item.DetailLink !== "undefined") {
        md.appendMarkdown("<hr>");
        md.appendMarkdown(
            `<p><strong>Full Details:</strong><br><a href="${item.DetailLink}">${item.DetailLink}</a></p>`,
        );
    }

    return md;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function appendValueIfDefined(md: vscode.MarkdownString, key: string, value: any): void {
    if (typeof value !== "undefined" || (typeof value === "string" && (value as string).trim() !== "")) {
        md.appendMarkdown(`${key}: ${value}\n`);
    }
}

export function deactivate() {}
