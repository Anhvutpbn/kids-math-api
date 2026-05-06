// Extracts min_max questions from sk04 → new sk08_min_max.csv
// Removes min_max rows from sk04_comparison.csv
// Run: node scripts/migrate-sk08.js

const fs = require('fs');
const path = require('path');

const SK04_PATH = path.join(__dirname, '../data/questions/sk04_comparison.csv');
const SK08_PATH = path.join(__dirname, '../data/questions/sk08_min_max.csv');

const sk04Lines = fs.readFileSync(SK04_PATH, 'utf-8').split('\n');
const header = sk04Lines[0];

const sk04Keep   = [header];
const sk08Rows   = [];
let sk08Id = 1;

for (let i = 1; i < sk04Lines.length; i++) {
  const line = sk04Lines[i].trim();
  if (!line) continue;

  // Check if it's a min_max row (field 3, index 2 when split by comma accounting for quoted fields)
  if (line.includes(',min_max,')) {
    // Rebuild with SK08 skill ID and new question ID
    const parts = line.split(',');
    // parts[0] = old ID (SK04_XXXX), parts[1] = SK04 → change to SK08, rest stays same
    parts[0] = `SK08_${String(sk08Id).padStart(4, '0')}`;
    parts[1] = 'SK08';
    sk08Rows.push(parts.join(','));
    sk08Id++;
  } else {
    sk04Keep.push(line);
  }
}

// Write sk08_min_max.csv
fs.writeFileSync(SK08_PATH, header + '\n' + sk08Rows.join('\n') + '\n');

// Overwrite sk04_comparison.csv without min_max rows
fs.writeFileSync(SK04_PATH, sk04Keep.join('\n') + '\n');

console.log(`✅ sk08_min_max.csv: ${sk08Rows.length} questions (SK08_0001 → SK08_${String(sk08Id-1).padStart(4,'0')})`);
console.log(`✅ sk04_comparison.csv: ${sk04Keep.length - 1} questions remaining`);
