const fs = require("node:fs");
const path = require("node:path");

console.log("Importing ammo data...");

const dataDir = path.join(__dirname, "../src/database");

const itemsPath = path.join(__dirname, "../assets/database/templates/items.json");
const itemsData = Object.values(JSON.parse(fs.readFileSync(itemsPath, "utf-8")));

// Dynamically find the ammo parent id.
let ammoParentId = "";
for (const itemData of itemsData) {
    if (itemData._name.toUpperCase() === "AMMO") {
        ammoParentId = itemData._id;
        break;
    }
}

// Iterate over the items and add the ammo items to a map.
const ammoItems = new Map();
for (const itemData of itemsData) {
    if (itemData._parent === ammoParentId) {
        ammoItems.set(itemData._id, itemData);
    }
}

console.log(`Found ${ammoItems.size} ammo items.`);

// Iterate over each of the language files within the data directory
const dataFiles = fs.readdirSync(dataDir);
for (const languageFile of dataFiles) {
    if (path.extname(languageFile) !== ".json") {
        continue;
    }

    const languagePath = path.join(dataDir, languageFile);
    const languageData = require(languagePath);

    for (const [ammoId, itemData] of ammoItems) {
        languageData[ammoId].Type = "Ammo";
        languageData[ammoId].Caliber = itemData._props.Caliber;
        languageData[ammoId].Damage = itemData._props.Damage;
        languageData[ammoId].ArmorDamage = itemData._props.ArmorDamage;
        languageData[ammoId].PenetrationPower = itemData._props.PenetrationPower;
        languageData[ammoId].FleaBlacklisted = ! itemData._props.CanSellOnRagfair;
        languageData[ammoId].Weight = itemData._props.Weight;
    }

    // Write back the updated language data.
    fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
}

console.log("Ammo data imported.");
