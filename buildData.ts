import * as fs from "node:fs";
import * as path from "node:path";
import { ICustomizationItem } from "./src/types/ICustomizationItem";
import { ILocationBase } from "./src/types/ILocationBase";
import { IQuest } from "./src/types/IQuest";
import { ITemplateItem } from "./src/types/ITemplateItem";
import { ItemDetailType, Items } from "./src/types/Items";
import { ITraderBase } from "./src/types/TraderData";

const localesDir = path.join(__dirname, "./assets/database/locales/global");
const dataDir = path.join(__dirname, "./src/database");
const itemsPath = path.join(__dirname, "./assets/database/templates/items.json");
const customizationPath = path.join(__dirname, "./assets/database/templates/customization.json");
const tradersDir = path.join(__dirname, "./assets/database/traders");
const locationDir = path.join(__dirname, "./assets/database/locations");
const questPath = path.join(__dirname, "./assets/database/templates/quests.json");

const buildData = async () => {
    console.log("Building data...");

    await optimizeLocales();
    await importGenericItemData();
    await importTraderData();
    await importCustomizationData();
    await importLocationData();
    await importQuestData();

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
        JSON.parse(fs.readFileSync(customizationPath, "utf-8")),
    );

    const dataFiles = fs.readdirSync(dataDir);
    for (const languageFile of dataFiles) {
        if (path.extname(languageFile) !== ".json") {
            continue;
        }

        const languagePath = path.join(dataDir, languageFile);
        const languageData: Items = require(languagePath);

        for (const customizationItemData of customizationData) {
            let languageItem = languageData[customizationItemData._id];

            // Create item if it doesn't exist. Better than nothing...
            if (!languageItem) {
                languageItem = languageData[customizationItemData._id] = {
                    Name:
                        customizationItemData._props.Name ||
                        customizationItemData._props.ShortName ||
                        customizationItemData._name,
                    ShortName:
                        customizationItemData._props.ShortName ||
                        customizationItemData._props.Name ||
                        customizationItemData._name,
                };
            }

            languageItem.Type = ItemDetailType.CUSTOMIZATION;
            languageItem.Description = customizationItemData._props.Description?.trim();
            languageItem.BodyPart = customizationItemData._props.BodyPart;
            languageItem.Sides = customizationItemData._props.Side?.join(", ");
            languageItem.IntegratedArmorVest = customizationItemData._props.IntegratedArmorVest;
            languageItem.AvailableAsDefault = customizationItemData._props.AvailableAsDefault;
            languageItem.PrefabPath = customizationItemData._props.Prefab?.path;
        }

        fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
    }

    console.log("Customization item data imported.");
};

const importLocationData = async (): Promise<void> => {
    console.log("Importing location data...");

    const locationWikiLinks: Map<string, string> = new Map();
    locationWikiLinks.set("bigmap", "https://escapefromtarkov.fandom.com/wiki/Customs");
    locationWikiLinks.set("factory4_day", "https://escapefromtarkov.fandom.com/wiki/Factory");
    locationWikiLinks.set("factory4_night", "https://escapefromtarkov.fandom.com/wiki/Factory");
    locationWikiLinks.set("interchange", "https://escapefromtarkov.fandom.com/wiki/Interchange");
    locationWikiLinks.set("laboratory", "https://escapefromtarkov.fandom.com/wiki/The_Lab");
    locationWikiLinks.set("lighthouse", "https://escapefromtarkov.fandom.com/wiki/Lighthouse");
    locationWikiLinks.set("rezervbase", "https://escapefromtarkov.fandom.com/wiki/Reserve");
    locationWikiLinks.set("sandbox", "https://escapefromtarkov.fandom.com/wiki/Ground_Zero");
    locationWikiLinks.set("sandbox_high", "https://escapefromtarkov.fandom.com/wiki/Ground_Zero");
    locationWikiLinks.set("shoreline", "https://escapefromtarkov.fandom.com/wiki/Shoreline");
    locationWikiLinks.set("tarkovstreets", "https://escapefromtarkov.fandom.com/wiki/Streets_of_Tarkov");
    locationWikiLinks.set("woods", "https://escapefromtarkov.fandom.com/wiki/Woods");

    const locationDirectories = fs.readdirSync(locationDir);
    for (const locationDirectory of locationDirectories) {
        const locationPath = path.join(locationDir, locationDirectory, "base.json");
        if (!fs.existsSync(locationPath)) {
            console.warn(`Location base.json not found: ${locationPath}`);
            continue;
        }

        try {
            const locationData: ILocationBase = require(locationPath);
            let locationName = "";

            const dataFiles = fs.readdirSync(dataDir);
            for (const languageFile of dataFiles) {
                if (path.extname(languageFile) !== ".json") {
                    continue;
                }

                const languagePath = path.join(dataDir, languageFile);
                const languageData: Items = require(languagePath);

                if (languageData?.[locationData._Id]) {
                    const languageItem = languageData[locationData._Id];

                    if (languageFile === "en.json") {
                        locationName = languageItem.Name;
                    }

                    languageItem.Type = ItemDetailType.LOCATION;
                    languageItem.Id = locationData.Id;
                    languageItem.AirdropChance = locationData.AirdropParameters?.[0].PlaneAirdropChance;
                    if (locationData.BossLocationSpawn) {
                        let bossSpawnDetails = "";
                        for (const boss of locationData.BossLocationSpawn) {
                            const excludedBosses = ["pmcUSEC", "pmcBEAR", "exUsec", "pmcBot"];
                            if (!excludedBosses.includes(boss.BossName)) {
                                bossSpawnDetails += `\n- ${boss.BossName} (${boss.BossChance}%)`;
                            }
                        }
                        if (bossSpawnDetails !== "") {
                            languageItem.BossSpawns = bossSpawnDetails;
                        }
                    }
                    languageItem.EscapeTimeLimit = locationData.EscapeTimeLimit;
                    languageItem.DetailLink = locationWikiLinks.get(locationData.Id.toLowerCase()) || undefined;
                } else {
                    console.warn(`Location ${locationData._Id} not found in ${languageFile}`);
                }
                fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
            }

            console.log(`Location data for ${locationName} imported.`);
        } catch (error) {
            console.error(`Error processing location data from ${locationPath}:`, error);
        }
    }

    console.log("Location data imported.");
};

const importQuestData = async (): Promise<void> => {
    console.log("Importing quest data...");

    const questsData: IQuest[] = Object.values(JSON.parse(fs.readFileSync(questPath, "utf-8")));

    const dataFiles = fs.readdirSync(dataDir);
    for (const languageFile of dataFiles) {
        if (path.extname(languageFile) !== ".json") {
            continue;
        }

        const languagePath = path.join(dataDir, languageFile);
        const languageData: Items = require(languagePath);

        for (const questData of questsData) {
            if (typeof languageData[questData._id] === "undefined") {
                console.log(`quest id ${questData._id} not found`);
                continue; // Skip items without translation data.
            }

            const languageItem = languageData[questData._id];

            languageItem.Type = ItemDetailType.QUEST;

            const traderName = languageData[questData.traderId]?.Name;
            if (traderName) {
                languageItem.Trader = traderName;
                languageItem.TraderLink = `https://escapefromtarkov.fandom.com/wiki/${traderName.replace(/ /g, "_")}`;
            }

            languageItem.TraderId = questData.traderId;
            languageItem.QuestType = questData.type;
            if (questData.QuestName) {
                languageItem.DetailLink = `https://escapefromtarkov.fandom.com/wiki/${questData.QuestName.replace(/ /g, "_")}`;
            }
        }

        fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
    }

    console.log("Quest info imported.");
};

buildData();
