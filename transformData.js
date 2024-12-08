const fs = require("node:fs");
const path = require("node:path");

console.log("Beginning operation to optimize language data.");

const localesDir = path.join(__dirname, "./assets/database/locales");
const outputDir = path.join(__dirname, "./src/database");

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(localesDir);

files.forEach((file) => {
    if (path.extname(file) === ".json") {
        const sourcePath = path.join(localesDir, file);
        const outputPath = path.join(outputDir, file);

        const sourceData = require(sourcePath);
        const transformedData = {};

        Object.keys(sourceData).forEach((key) => {
            const parts = key.split(" ");
            if (parts.length === 2) {
                const [id, property] = parts;
                if (id.length === 24) {
                    const normalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);

                    // Detecting trader nicknames and setting them as Name and ShortName
                    if (normalizedProperty === "Nickname") {
                        if (!transformedData[id]) {
                            transformedData[id] = {};
                        }
                        const nicknameValue = sourceData[key] && sourceData[key].trim();
                        if (nicknameValue) {
                            transformedData[id].Name = nicknameValue;
                            transformedData[id].ShortName = nicknameValue;
                        }
                    } else if (normalizedProperty === "Name" || normalizedProperty === "ShortName") {
                        if (!transformedData[id]) {
                            transformedData[id] = {};
                        }

                        // Get the current value, trimming for spaces, and only use non-empty values
                        const currentValue = sourceData[key] && sourceData[key].trim();

                        // Set the property if there's a current value
                        if (currentValue) {
                            transformedData[id][normalizedProperty] = currentValue;

                            // Ensure both properties are populated
                            if (!transformedData[id].Name) {
                                transformedData[id].Name = currentValue;
                            }
                            if (!transformedData[id].ShortName) {
                                transformedData[id].ShortName = currentValue;
                            }
                        }
                    }
                }
            }
        });

        // Remove entries if neither property ends up set
        Object.keys(transformedData).forEach((id) => {
            if (transformedData[id] && !transformedData[id].Name && !transformedData[id].ShortName) {
                delete transformedData[id];
            }
        });

        // Write to file only if there's something to write
        if (Object.keys(transformedData).length > 0) {
            fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), "utf-8");
            console.log(`Optimized ${outputPath}`);
        } else {
            console.log(`No valid entries found for ${outputPath}, no file written.`);
        }
    }
});

console.log("Language data has been optimized.");
