// Generates ~1000 min_max questions and appends to sk04_comparison.csv
// Run: node scripts/gen-minmax.js

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../data/questions/sk04_comparison.csv');
const START_ID = 536; // after existing SK04_0535

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(pool, n) {
  return shuffle(pool).slice(0, n);
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function fmtId(n) {
  return `SK04_${String(n).padStart(4, '0')}`;
}

const rows = [];
let id = START_ID;

function addPair(combo, difficulty, hintMin, hintMax) {
  const shuffled = shuffle(combo);
  const optStr = shuffled.join(',');
  const min = Math.min(...combo);
  const max = Math.max(...combo);
  rows.push(`${fmtId(id++)},SK04,min_max,Chọn số BÉ nhất,Choose the smallest number,"${optStr}",${min},${difficulty},${hintMin}`);
  rows.push(`${fmtId(id++)},SK04,min_max,Chọn số LỚN nhất,Choose the largest number,"${optStr}",${max},${difficulty},${hintMax}`);
}

// ── Difficulty 1: 6 numbers from 1–10, 175 unique combos → 350 questions ──
const pool1 = range(1, 10);
const seen1 = new Set();
while (seen1.size < 175) {
  const combo = sample(pool1, 6);
  const key = [...combo].sort((a, b) => a - b).join(',');
  if (!seen1.has(key)) {
    seen1.add(key);
    addPair(combo, 1,
      'Số bé nhất là số nhỏ hơn tất cả các số còn lại',
      'Số lớn nhất là số lớn hơn tất cả các số còn lại');
  }
}

// ── Difficulty 2: 7–8 numbers from 1–20, 175 unique combos → 350 questions ──
const pool2 = range(1, 20);
const seen2 = new Set();
let d2attempt = 0;
while (seen2.size < 175 && d2attempt < 10000) {
  d2attempt++;
  const count = Math.random() < 0.5 ? 7 : 8;
  const combo = sample(pool2, count);
  const key = [...combo].sort((a, b) => a - b).join(',');
  if (!seen2.has(key)) {
    seen2.add(key);
    addPair(combo, 2,
      'Tìm số bé hơn tất cả số kia',
      'Tìm số lớn hơn tất cả số kia');
  }
}

// ── Difficulty 3: 8–9 numbers from 1–50, 150 unique combos → 300 questions ──
const pool3 = range(1, 50);
const seen3 = new Set();
let d3attempt = 0;
while (seen3.size < 150 && d3attempt < 10000) {
  d3attempt++;
  const count = Math.random() < 0.5 ? 8 : 9;
  const combo = sample(pool3, count);
  const key = [...combo].sort((a, b) => a - b).join(',');
  if (!seen3.has(key)) {
    seen3.add(key);
    addPair(combo, 3,
      'Đọc kỹ từng số rồi tìm số bé nhất',
      'Đọc kỹ từng số rồi tìm số lớn nhất');
  }
}

fs.appendFileSync(CSV_PATH, rows.join('\n') + '\n');

console.log(`✅ Generated ${rows.length} questions`);
console.log(`   D1: ${seen1.size * 2}  |  D2: ${seen2.size * 2}  |  D3: ${seen3.size * 2}`);
console.log(`   IDs: ${fmtId(START_ID)} → ${fmtId(id - 1)}`);
