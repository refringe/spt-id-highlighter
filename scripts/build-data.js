const path = require("node:path");

// Convert the Locale data to a format that can be easily used by the extention.
const transformLocalesPath = path.join(__dirname, "transformLocales.js");
require(transformLocalesPath);

// Update the extention database to include trader information.
const updateTradersPath = path.join(__dirname, "updateTraders.js");
require(updateTradersPath);
