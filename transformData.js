const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, './assets/database/locales');
const outputDir = path.join(__dirname, './src/database');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    if (path.extname(file) === '.json') {
        const sourcePath = path.join(sourceDir, file);
        const outputPath = path.join(outputDir, file);

        const sourceData = require(sourcePath);
        const transformedData = {};

        Object.keys(sourceData).forEach(key => {
            const [id, property] = key.split(' ');
            // Check if the ID is 24 characters long
            if (id.length === 24) {
                if (!transformedData[id]) {
                    transformedData[id] = {};
                }
                // Check if the property is either 'Name' or 'ShortName'
                if (property === 'Name' || property === 'ShortName') {
                    // Check if both 'Name' and 'ShortName' exist for the ID
                    if (sourceData[`${id} Name`] && sourceData[`${id} ShortName`]) {
                        transformedData[id][property] = sourceData[key];
                    }
                }
            }
        });

        fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8');
        console.log(`Transformed data written to ${outputPath}`);
    }
});
