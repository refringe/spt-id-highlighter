const axios = require('axios');
const fs = require('fs');

// File Paths for import Json and output (be aware there is a search on keywords that only work in english)
const inputFileName = './assets/database/locales/en.json'; 
const outputFileName = './assets/database/locales/en-ammo.json'; 

// Delay to not DDOS the API
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateJsonData() {
  let data;
  try {
    const fileContent = fs.readFileSync(inputFileName, 'utf-8');
    data = JSON.parse(fileContent); // JSON-Daten parsen
  } catch (error) {
    console.error(`Error when loading ${inputFileName}:`, error);
    return;
  }

  // Keywords for which the ItemID API shoul be called an DMG & PEN Values are loaded
  const keywords = ['cartridge', 'bullet', 'buckshot shell','slug','gauge round','buckshot','ammunition','flechettes'];

  // Little Counter to show progress
  const totalEntries = Object.keys(data).filter(key => key.includes(" Name")).length;
  let processedEntries = 0;

  console.log(`Starte die Verarbeitung von ${totalEntries} Einträgen...`);
  for (const key in data) {
    // Only edit the Name Attributes
    if (key.includes(" Name")) {
      // Extract ID from Key (Number before a space)
      const id = key.split(' ')[0];
      // Grab the corresponding description
      const descriptionKey = key.replace(" Name", " Description");
      const description = data[descriptionKey];

      // Check if any Keyword is used in the description
      if (description && keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        try {
          // Get Data from API
          const response = await axios.get(`https://db.sp-tarkov.com/api/item?id=${id}&locale=en`);
          const itemProps = response.data.item._props;
          
          // extract Damage and PenetrationPower
          const damage = itemProps.Damage;
          const penetrationPower = itemProps.PenetrationPower;
          const ammoType = itemProps.ammoType;

          // Update Name field
          if (damage !== undefined && penetrationPower !== undefined) {
            const originalName = data[key];
            // calculate total damage for buckshot ammo
            if (ammoType === 'buckshot') {
              damage = damage * itemProps.buckshotBullets
            }
            // Update name with (Damage/PenetrationPower)
            data[key] = `${originalName} (${damage}/${penetrationPower})`;
          }

        } catch (error) {
          console.error(`Error when grabbing data for Item: ${id}`, error);
        }

        // Wait for 500 Milliseconds
        await delay(500); 
      }
      // Update Script status
      processedEntries++;
      console.log(`Entries updated: ${processedEntries}/${totalEntries}`);
    }
  }

  // Save output File
  try {
    fs.writeFileSync(outputFileName, JSON.stringify(data, null, 2));
    console.log(`JSON-File successfully updated and saved into ${outputFileName}.`);
  } catch (error) {
    console.error(`Error when trying to save File: ${outputFileName}:`, error);
  }
}

// run the script / function
updateJsonData();
