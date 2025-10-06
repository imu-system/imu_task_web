#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const frPath = path.join(messagesDir, 'fr.json');
const enPath = path.join(messagesDir, 'en.json');
const jpPath = path.join(messagesDir, 'jp.json');

const frData = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const jpData = JSON.parse(fs.readFileSync(jpPath, 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(fullKey);
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const frKeys = getAllKeys(frData);
const enKeys = getAllKeys(enData);
const jpKeys = getAllKeys(jpData);

console.log('\n=== Statistiques ===');
console.log(`Français: ${frKeys.length} clés`);
console.log(`Anglais: ${enKeys.length} clés`);
console.log(`Japonais: ${jpKeys.length} clés`);

console.log('\n=== Clés manquantes en Anglais ===');
const missingInEn = frKeys.filter(key => !enKeys.includes(key));
console.log(`${missingInEn.length} clés manquantes`);
if (missingInEn.length > 0 && missingInEn.length < 50) {
  missingInEn.forEach(key => console.log(`  - ${key}`));
}

console.log('\n=== Clés manquantes en Japonais ===');
const missingInJp = frKeys.filter(key => !jpKeys.includes(key));
console.log(`${missingInJp.length} clés manquantes`);
if (missingInJp.length > 0 && missingInJp.length < 100) {
  console.log('\nPremières 20 clés manquantes:');
  missingInJp.slice(0, 20).forEach(key => console.log(`  - ${key}`));
}

// Identifier les sections principales manquantes
const missingTopLevel = {};
missingInJp.forEach(key => {
  const topLevel = key.split('.')[0];
  if (!missingTopLevel[topLevel]) {
    missingTopLevel[topLevel] = 0;
  }
  missingTopLevel[topLevel]++;
});

console.log('\n=== Sections principales manquantes en Japonais ===');
Object.entries(missingTopLevel)
  .sort((a, b) => b[1] - a[1])
  .forEach(([section, count]) => {
    console.log(`  ${section}: ${count} clés manquantes`);
  });
