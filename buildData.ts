import * as fs from "node:fs";
import * as path from "node:path";
import { ICustomizationItem } from "./src/types/ICustomizationItem";
import { ITemplateItem } from "./src/types/ITemplateItem";
import { ItemDetailType, Items } from "./src/types/Items";
import { ITraderBase } from "./src/types/TraderData";

const localesDir = path.join(__dirname, "./assets/database/locales/global");
const dataDir = path.join(__dirname, "./src/database");
const itemsPath = path.join(__dirname, "./assets/database/templates/items.json");
const customizationsPath = path.join(__dirname, "./assets/database/templates/customization.json");
const tradersDir = path.join(__dirname, "./assets/database/traders");

const buildData = async () => {
    console.log("Building data...");

    await optimizeLocales();
    await importGenericItemData();
    await importTraderData();
    await importCustomizationData();

    console.log("Data built successfully.");
};

const optimizeLocales = async (): Promise<void> => {
    console.log("Optimizing locale data...");

    const files = fs.readdirSync(localesDir);
    for (const file of files) {
        if (path.extname(file) !== ".json") {
            continue;
        }

        const sourcePath = path.join(localesDir, file);
        const outputPath = path.join(dataDir, file);

        const sourceData = require(sourcePath);
        const transformedData: Items = {};

        for (const key of Object.keys(sourceData)) {
            const parts = key.split(" ");

            if (parts.length !== 2) {
                continue;
            }

            const [id, property] = parts;

            if (id.length !== 24) {
                continue;
            }

            const normalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);

            if (!transformedData[id]) {
                transformedData[id] = {
                    Name: "",
                    ShortName: "",
                };
            }

            if (normalizedProperty === "Nickname") {
                const nicknameValue = sourceData[key]?.trim();
                if (nicknameValue) {
                    transformedData[id].Name = nicknameValue;
                    transformedData[id].ShortName = nicknameValue;
                }
            } else if (normalizedProperty === "Name" || normalizedProperty === "ShortName") {
                const currentValue = sourceData[key]?.trim();
                if (currentValue) {
                    transformedData[id][normalizedProperty] = currentValue;

                    if (!transformedData[id].Name) {
                        transformedData[id].Name = currentValue;
                    }
                    if (!transformedData[id].ShortName) {
                        transformedData[id].ShortName = currentValue;
                    }
                }
            }
        }

        // Remove entries if neither property ends up set
        for (const id of Object.keys(transformedData)) {
            if (transformedData[id] && !transformedData[id].Name && !transformedData[id].ShortName) {
                delete transformedData[id];
            }
        }

        if (Object.keys(transformedData).length > 0) {
            fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), "utf-8");
            console.log(`Optimized ${outputPath}`);
        } else {
            console.log(`No valid entries found for ${outputPath}, no file written.`);
        }
    }

    console.log("Locale data optimized.");
};

const importGenericItemData = async (): Promise<void> => {
    console.log("Importing generic item data...");

    const itemsData: ITemplateItem[] = Object.values(JSON.parse(fs.readFileSync(itemsPath, "utf-8")));

    // Create a map of parent items for faster lookup
    const parentItems: Map<string, ITemplateItem | null> = new Map();
    for (const itemData of itemsData) {
        parentItems.set(itemData._parent, null); // Initialize all parents to null
    }

    for (const itemData of itemsData) {
        if (parentItems.has(itemData._id)) {
            parentItems.set(itemData._id, itemData); // Set the actual parent data
        }
    }

    console.log(`Found ${parentItems.size} parent items.`);

    const dataFiles = fs.readdirSync(dataDir);
    for (const languageFile of dataFiles) {
        if (path.extname(languageFile) !== ".json") {
            continue;
        }

        const languagePath = path.join(dataDir, languageFile);
        const languageData: Items = require(languagePath);

        for (const itemData of itemsData) {
            if (typeof languageData[itemData._id] === "undefined") {
                continue; // Skip items without translation data.
            }

            const languageItem = languageData[itemData._id]; // Get the item in the language data

            languageItem.Type = ItemDetailType.ITEM;
            languageItem.DetailLink = `https://db.sp-tarkov.com/search/${itemData._id}`;

            const parentData = parentItems.get(itemData._parent);
            if (parentData) {
                languageItem.Parent = parentData._name;
                languageItem.ParentID = itemData._parent;
                languageItem.ParentDetailLink = `https://db.sp-tarkov.com/search/${itemData._parent}`;
            }

            languageItem.FleaBlacklisted = !itemData._props.CanSellOnRagfair;
            languageItem.Weight = itemData._props.Weight;

            if (languageItem.Parent === ItemDetailType.AMMO) {
                languageItem.Caliber = itemData._props.Caliber;
                languageItem.Damage = itemData._props.Damage;
                languageItem.ArmorDamage = itemData._props.ArmorDamage;
                languageItem.PenetrationPower = itemData._props.PenetrationPower;
            }
        }

        fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
    }

    console.log("Generic item info imported.");
};

const importTraderData = async (): Promise<void> => {
    console.log("Importing trader data...");

    const traderDirectories = fs.readdirSync(tradersDir);
    for (const traderDirectory of traderDirectories) {
        const traderPath = path.join(tradersDir, traderDirectory, "base.json");
        if (!fs.existsSync(traderPath)) {
            console.warn(`Trader base.json not found: ${traderPath}`); // Warn if file is missing
            continue;
        }

        try {
            const traderData: ITraderBase = require(traderPath);
            let traderName = "";

            const dataFiles = fs.readdirSync(dataDir);
            for (const languageFile of dataFiles) {
                if (path.extname(languageFile) !== ".json") {
                    continue;
                }

                const languagePath = path.join(dataDir, languageFile);
                const languageData: Items = require(languagePath); // Type the languageData

                if (languageData?.[traderData._id]) {
                    const languageItem = languageData[traderData._id]; // Get the Trader Item

                    if (languageFile === "en.json") {
                        traderName = languageItem.Name;
                    }

                    languageItem.Type = ItemDetailType.TRADER;
                    languageItem.Currency = traderData.currency;
                    languageItem.UnlockedByDefault = traderData.unlockedByDefault;
                } else {
                    console.warn(`Trader ${traderData._id} not found in ${languageFile}`);
                }
                fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
            }

            console.log(`Trader data for ${traderName} imported.`);
        } catch (error) {
            console.error(`Error processing trader data from ${traderPath}:`, error);
        }
    }

    console.log("Trader data imported.");
};

const importCustomizationData = async (): Promise<void> => {
    console.log("Importing customization item data...");

    const customizationData: ICustomizationItem[] = Object.values(
        JSON.parse(fs.readFileSync(customizationsPath, "utf-8")),
    );

    const dataFiles = fs.readdirSync(dataDir);
    for (const languageFile of dataFiles) {
        if (path.extname(languageFile) !== ".json") {
            continue;
        }

        const languagePath = path.join(dataDir, languageFile);
        const languageData: Items = require(languagePath);

        for (const customizationItemData of customizationData) {
            if (typeof languageData[customizationItemData._id] === "undefined") {
                // TODO: Instead of skipping, create a new entry for the customization item using the available data for every language. Better than nothing, I guess
                continue;
            }

            const languageItem = languageData[customizationItemData._id]; // Get the item in the language data

            languageItem.Type = ItemDetailType.CUSTOMIZATION;
            languageItem.Description = customizationItemData._props.Description;
            languageItem.BodyPart = customizationItemData._props.BodyPart;
            languageItem.Sides = customizationItemData._props.Side.join(", ");
            languageItem.IntegratedArmorVest = customizationItemData._props.IntegratedArmorVest;
            languageItem.AvailableAsDefault = customizationItemData._props.AvailableAsDefault;
            languageItem.PrefabPath = customizationItemData._props.Prefab?.path;
        }

        fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
    }

    console.log("Customization item data imported.");
};

buildData();
