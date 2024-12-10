const fs = require("node:fs");
const path = require("node:path");

console.log("Importing trader data...");

const dataDir = path.join(__dirname, "../src/database");
const tradersDir = path.join(__dirname, "../assets/database/traders");

const traderDirectories = fs.readdirSync(tradersDir);
for (const traderDirectory of traderDirectories) {
    const traderPath = path.join(tradersDir, traderDirectory, "base.json");
    if (!fs.existsSync(traderPath)) {
        continue;
    }

    const traderData = require(traderPath);
    let traderName = "";

    // Iterate over each of the language files within the data directory and attempt to find this trader id.
    const dataFiles = fs.readdirSync(dataDir);
    for (const languageFile of dataFiles) {
        if (path.extname(languageFile) !== ".json") {
            continue;
        }

        const languagePath = path.join(dataDir, languageFile);
        const languageData = require(languagePath);

        if (languageFile === "en.json") {
            traderName = languageData[traderData._id].Name;
        }

        languageData[traderData._id].Type = "Trader";
        languageData[traderData._id].Currency = traderData.currency;
        languageData[traderData._id].UnlockedByDefault = traderData.unlockedByDefault;

        // Write back the updated language data.
        fs.writeFileSync(languagePath, JSON.stringify(languageData, null, 2), "utf-8");
    }

    console.log(`Trader data for ${traderName} imported.`);
}

console.log("Trader data imported.");
