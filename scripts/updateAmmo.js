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

// Iterate over the ammo items and import the data.
for (const [id, itemData] of ammoItems) {
    //
}

console.log("Ammo data imported.");
