const fs = require("node:fs");
const path = require("node:path");

console.log("Importing generic item data...");

const dataDir = path.join(__dirname, "../src/database");

const itemsPath = path.join(__dirname, "../assets/database/templates/items.json");
const itemsData = Object.values(JSON.parse(fs.readFileSync(itemsPath, "utf-8")));

// Iterate over the items and add parent IDs to a map
const parentItems = new Map();
for (const itemData of itemsData) {
    parentItems.set(itemData._parent, null);
}

// Update the parent items with their data
for (const itemData of itemsData) {
    if (parentItems.has(itemData._id)) {
        parentItems.set(itemData._id, itemData);
    }
}

console.log(`Found ${parentItems.size} parent items.`);

// Iterate over each of the language files within the data directory
const dataFiles = fs.readdirSync(dataDir);
for (const languageFile of dataFiles) {
    if (path.extname(languageFile) !== ".json") {
        continue;
    }

    const languagePath = path.join(dataDir, languageFile);
    const languageData = require(languagePath);

    // Iterate over each of the items and add some generic information to each of the language database files.
    for (const itemData of itemsData) {
        // Skip items that have no translation data
        if (typeof languageData[itemData._id] === "undefined") {
            continue;
        }

        languageData[itemData._id].DetailLink = `https://db.sp-tarkov.com/search/${itemData._id}`;
        languageData[itemData._id].Parent = parentItems.get(itemData._parent)._name;
        languageData[itemData._id].ParentID = itemData._parent;
        languageData[itemData._id].ParentDetailLink = `https://db.sp-tarkov.com/search/${itemData._parent}`;
        languageData[itemData._id].FleaBlacklisted = !itemData._props.CanSellOnRagfair;
        languageData[itemData._id].Weight = itemData._props.Weight;

        if (languageData[itemData._id].Parent.toUpperCase() === "AMMO") {
            languageData[itemData._id].Caliber = itemData._props.Caliber;
            languageData[itemData._id].Damage = itemData._props.Damage;
            languageData[itemData._id].ArmorDamage = itemData._props.ArmorDamage;
            languageData[itemData._id].PenetrationPower = itemData._props.PenetrationPower;
            languageData[itemData._id].Weight = itemData._props.Weight;
        }
    }

    // Write back the updated language data.
    fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
}

console.log("Generic item info imported.");
