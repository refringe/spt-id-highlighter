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

    const loadTranslations = (lang: string): Record<string, string> => {
        try {
            return require(`./translations/${lang}.json`);
        } catch (error) {
            console.error(`Failed to load translation file: ${lang}.json`, error);
            vscode.window.showErrorMessage(`Failed to load translations for ${lang}. Falling back to English.`);
            return require("./translations/en.json"); // Fallback to English
        }
    };

    let configuration = vscode.workspace.getConfiguration("spt-dev");
    let language = configuration.get("language", "en");
    let nameType = configuration.get("nameType", "Name");
    let itemsData: Items = loadItemsData(language);
    let translations: Record<string, string> = loadTranslations(language);

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
                translations = loadTranslations(language);
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
                    return new vscode.Hover(createHoverContent(itemData, translations));
                }
            },
        }),
    );
}

function createHoverContent(item: ItemDetails, translations: Record<string, string>): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.supportHtml = true;

    let header = `<h3>${item.Name}`;
    if (item.Name !== item.ShortName) {
        header += ` [<em>${item.ShortName}</em>]`;
    }
    header += "</h3>";
    md.appendMarkdown(header);

    md.appendMarkdown("<pre>");
    appendValueIfDefined(md, translations["Type:"], item.Type);

    if (typeof item.Parent !== "undefined" && typeof item.ParentID !== "undefined") {
        md.appendMarkdown(
            `${translations["Parent:"]} ${item.Parent} - <a href="${item.ParentDetailLink}">${item.ParentID}</a>\n`,
        );
    }

    if (item.Type === ItemDetailType.AMMO) {
        appendValueIfDefined(md, translations["Caliber:"], item.Caliber);
        appendValueIfDefined(md, translations["Damage:"], item.Damage);
        appendValueIfDefined(md, translations["Armor Damage:"], item.ArmorDamage);
        appendValueIfDefined(md, translations["Penetration Power:"], item.PenetrationPower);
    }

    if (item.Type === ItemDetailType.CUSTOMIZATION) {
        appendValueIfDefined(md, translations["Description:"], item.Description);
        appendValueIfDefined(md, translations["Body Part:"], item.BodyPart);
        appendValueIfDefined(md, translations["Sides:"], item.Sides);
        appendValueIfDefined(md, translations["Integrated Armor:"], item.IntegratedArmorVest);
        appendValueIfDefined(md, translations["Available By Default:"], item.AvailableAsDefault);
        appendValueIfDefined(md, translations["Prefab Path:"], item.PrefabPath);
    }

    if (item.Type === ItemDetailType.LOCATION) {
        appendValueIfDefined(md, translations["Map ID:"], item.Id);
        appendValueIfDefined(md, translations["Airdrop Chance:"], item.AirdropChance);
        appendValueIfDefined(md, translations["Time Limit:"], item.EscapeTimeLimit);
        appendValueIfDefined(md, translations["Insurance:"], item.Insurance);
        appendValueIfDefined(md, translations["Boss Spawns:"], item.BossSpawns);
    }

    if (item.Type === ItemDetailType.QUEST) {
        if (typeof item.Trader !== "undefined" && typeof item.TraderId !== "undefined") {
            md.appendMarkdown(
                `${translations["Trader:"]} ${item.Trader} - <a href="${item.TraderLink}">${item.TraderId}</a>\n`,
            );
        } else {
            appendValueIfDefined(md, translations["Trader ID:"], item.TraderId);
        }
        appendValueIfDefined(md, translations["Quest Type:"], item.QuestType);
    }

    appendValueIfDefined(md, translations["Weight:"], item.Weight);
    appendValueIfDefined(md, translations["Flea Blacklisted:"], item.FleaBlacklisted);
    appendValueIfDefined(md, translations["Unlocked By Default:"], item.UnlockedByDefault);

    md.appendMarkdown("</pre>");

    if (typeof item.DetailLink !== "undefined") {
        md.appendMarkdown("<hr>");
        md.appendMarkdown(
            `<p><strong>${translations["Full Details:"]}</strong><br><a href="${item.DetailLink}">${item.DetailLink}</a></p>`,
        );
    }

    return md;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function appendValueIfDefined(md: vscode.MarkdownString, key: string, value: any): void {
    if (typeof value !== "undefined" || (typeof value === "string" && (value as string).trim() !== "")) {
        md.appendMarkdown(`${key} ${value}\n`);
    }
}

export function deactivate() {}
