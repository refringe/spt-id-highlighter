import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { ItemDetailType, ItemDetails, Items } from "./types/Items";

export function activate(context: vscode.ExtensionContext) {
    console.log("The SPT ID Highlighter extension is now active.");

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const validateItemDetails = (details: any): details is ItemDetails => {
        const validItemKeys: Array<keyof ItemDetails> = [
            "Name",
            "ShortName",
            "Type",
            "DetailLink",
            "Parent",
            "ParentID",
            "ParentDetailLink",
            "FleaBlacklisted",
            "QuestItem",
            "Weight",
            "Caliber",
            "Damage",
            "ArmorDamage",
            "PenetrationPower",
            "Currency",
            "UnlockedByDefault",
            "Description",
            "BodyPart",
            "Sides",
            "IntegratedArmorVest",
            "AvailableAsDefault",
            "PrefabPath",
            "Id",
            "AirdropChance",
            "EscapeTimeLimit",
            "Insurance",
            "BossSpawns",
            "Trader",
            "TraderId",
            "TraderLink",
            "QuestType",
        ];
        return Object.keys(details).every((key) => validItemKeys.includes(key as keyof ItemDetails));
    };

    const getProjectRoot = (): string => {
        const folders = vscode.workspace.workspaceFolders;
        return folders && folders.length > 0 ? folders[0].uri.fsPath : "";
    };

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const loadCustomIds = (projectRoot: string): Record<string, any> => {
        const sptidsPath = path.join(projectRoot, ".sptids");
        if (!fs.existsSync(sptidsPath)) {
            return {};
        }

        try {
            const rawData = fs.readFileSync(sptidsPath, "utf-8");
            return JSON.parse(rawData);
        } catch (error) {
            console.error(`SPT ID Highlighter: Failed to load .sptids file: ${error}`);
            vscode.window.showErrorMessage("SPT ID Highlighter: The .sptids file is invalid or could not be read.");
            return {};
        }
    };

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const mergeCustomItems = (baseData: Items, customData: Record<string, any>, lang: string): Items => {
        const mergedData = { ...baseData };

        for (const [id, localizedData] of Object.entries(customData)) {
            if (localizedData[lang]) {
                const customDetails = localizedData[lang];
                if (validateItemDetails(customDetails)) {
                    mergedData[id] = {
                        ...mergedData[id],
                        ...customDetails,
                    };
                } else {
                    console.warn(`SPT ID Highlighter: Invalid item properties for ID ${id} in .sptids.`);
                    vscode.window.showWarningMessage(
                        `SPT ID Highlighter: Invalid item properties for ID ${id} in .sptids.`,
                    );
                }
            }
        }

        return mergedData;
    };

    const loadItemsData = (lang: string): Items => {
        try {
            const baseData = require(`./database/${lang}.json`);
            const projectRoot = getProjectRoot();
            const customData = loadCustomIds(projectRoot);
            return mergeCustomItems(baseData, customData, lang);
        } catch (error) {
            console.error(`SPT ID Highlighter: Failed to load language file: ${lang}.json`, error);
            vscode.window.showErrorMessage(
                `SPT ID Highlighter: Failed to load language data for ${lang}. Falling back to English.`,
            );
            return require("./database/en.json");
        }
    };

    const loadTranslations = (lang: string): Record<string, string> => {
        try {
            return require(`./translations/${lang}.json`);
        } catch (error) {
            console.error(`SPT ID Highlighter: Failed to load translation file: ${lang}.json`, error);
            vscode.window.showErrorMessage(
                `SPT ID Highlighter: Failed to load translations for ${lang}. Falling back to English.`,
            );
            return require("./translations/en.json"); // Fallback to English
        }
    };

    let configuration = vscode.workspace.getConfiguration("spt-id-highlighter");
    let language = configuration.get("language", "en");
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

    const projectRoot = getProjectRoot();
    if (fs.existsSync(projectRoot)) {
        const watcher = fs.watch(projectRoot, (eventType, filename) => {
            if (filename === ".sptids") {
                const sptidsPath = path.join(projectRoot, ".sptids");
                if (eventType === "rename") {
                    // File created or deleted
                    if (fs.existsSync(sptidsPath)) {
                        console.log("SPT ID Highlighter: Detected .sptids creation. Reloading...");
                        itemsData = loadItemsData(language); // Reload items data
                        updateDecorations(); // Update decorations
                        vscode.window.showInformationMessage("SPT ID Highlighter: Successfully loaded custom items.");
                    } else {
                        console.log("SPT ID Highlighter: Detected .sptids file deletion.");
                        itemsData = loadItemsData(language); // Reload without custom items
                        updateDecorations(); // Update decorations
                        vscode.window.showWarningMessage("SPT ID Highlighter: Successfully unloaded custom items.");
                    }
                } else if (eventType === "change") {
                    // File updated
                    console.log("SPT ID Highlighter: Detected .sptids file change. Reloading...");
                    itemsData = loadItemsData(language); // Reload items data
                    updateDecorations(); // Update decorations
                    vscode.window.showInformationMessage("SPT ID Highlighter: Successfully reloaded custom items.");
                }
            }
        });
        context.subscriptions.push({
            dispose: () => watcher.close(),
        });
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("spt-id-highlighter.language")) {
                configuration = vscode.workspace.getConfiguration("spt-id-highlighter");
                language = configuration.get("language", "en");
                itemsData = loadItemsData(language);
                translations = loadTranslations(language);
                updateDecorations();
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
