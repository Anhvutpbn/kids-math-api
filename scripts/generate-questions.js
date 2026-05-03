/**
 * Question Generator — Kids Math API
 * Sinh tự động câu hỏi từ template toán học cho 7 skills.
 * Run: node scripts/generate-questions.js
 * Output: data/questions/sk0X_*.csv (replace existing files)
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../data/questions');

// ─── HELPERS ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueWrongOptions(correct, pool, count = 3) {
  const wrong = pool.filter(n => n !== correct);
  return shuffle(wrong).slice(0, count);
}

function makeOptions(correct, wrong3) {
  return shuffle([correct, ...wrong3]).join(',');
}

function csvRow(id, skillId, type, qVi, qEn, options, answer, difficulty, hint) {
  // Escape fields that may contain commas
  const esc = v => (String(v).includes(',') ? `"${v}"` : String(v));
  return [id, skillId, type, esc(qVi), esc(qEn), esc(options), esc(answer), difficulty, esc(hint)].join(',');
}

function writeCsv(filename, rows) {
  const header = 'id,skill_id,type,question_vi,question_en,options,correct_answer,difficulty,hint_vi';
  const content = [header, ...rows].join('\n') + '\n';
  fs.writeFileSync(path.join(OUT_DIR, filename), content, 'utf8');
  console.log(`  ${filename}: ${rows.length} câu`);
}

// ─── SK01 — Nhận biết số 0–10 ───────────────────────────────────────────────
// Target: ~1000 câu
function generateSK01() {
  const rows = [];
  let idx = 1;
  const id = () => `SK01_${String(idx++).padStart(4, '0')}`;

  const pool0to10 = [0,1,2,3,4,5,6,7,8,9,10];

  // Template A: "Số nào đây là số N?" — multiple choice, diff 1 (0-5), diff 2 (6-10)
  for (const n of pool0to10) {
    const diff = n <= 5 ? 1 : 2;
    const wrong = uniqueWrongOptions(n, pool0to10);
    const opts = makeOptions(n, wrong);
    const viQ = `Số nào đây là số ${n}?`;
    const enQ = `Which one is number ${n}?`;
    const hint = n === 0 ? 'Số không có gì cả là số 0' : `Đếm từ 1 đến ${n} nhé`;
    rows.push(csvRow(id(), 'SK01', 'multiple_choice', viQ, enQ, opts, n, diff, hint));
  }

  // Template B: "Số nào đứng trước N?" — diff 1/2
  for (const n of [1,2,3,4,5,6,7,8,9,10]) {
    const diff = n <= 5 ? 1 : 2;
    const correct = n - 1;
    const wrong = uniqueWrongOptions(correct, pool0to10);
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Số nào đứng trước số ${n}?`, `Which number comes before ${n}?`,
      makeOptions(correct, wrong), correct, diff, `Đếm ngược từ ${n}`));
  }

  // Template C: "Số nào đứng sau N?"
  for (const n of [0,1,2,3,4,5,6,7,8,9]) {
    const diff = n <= 4 ? 1 : 2;
    const correct = n + 1;
    const wrong = uniqueWrongOptions(correct, pool0to10);
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Số nào đứng sau số ${n}?`, `Which number comes after ${n}?`,
      makeOptions(correct, wrong), correct, diff, `Đếm tiếp từ ${n}`));
  }

  // Template D: fill_blank sequence "A B _ D" — diff 1
  const seqs1 = [
    [0,1,'_',3], [1,'_',3,4], [2,3,'_',5], [3,'_',5,6],
    [4,5,'_',7], ['_',6,7,8], [5,6,'_',8], [6,'_',8,9],
    [7,8,'_',10], ['_',1,2,3], [0,'_',2,3], [1,2,3,'_'],
    [4,'_',6,7], [2,'_',4,5],
  ];
  for (const seq of seqs1) {
    const pos = seq.indexOf('_');
    const correct = [0,1,2,3,4,5,6,7,8,9,10][pos === 0 ? seq[1]-1 : pos === seq.length-1 ? seq[seq.length-2]+1 : seq[pos-1]+1];
    const display = seq.join(' ');
    rows.push(csvRow(id(), 'SK01', 'fill_blank',
      `Điền số còn thiếu: ${display}`, `Fill the blank: ${display}`,
      '', correct, 1, `Tìm số nằm đúng vị trí trong dãy`));
  }

  // Template E: fill_blank harder sequences — diff 2
  const seqs2 = [
    ['_',2,3,4,5], [3,4,'_',6,7], [5,'_',7,8,9], [6,7,8,'_',10],
    ['_',0,1,2], [1,2,3,4,'_'], [0,1,'_',3,4], [7,'_',9,10],
  ];
  for (const seq of seqs2) {
    const pos = seq.indexOf('_');
    const correct = pos === 0 ? seq[1]-1 : seq[pos-1]+1;
    const display = seq.join(' ');
    rows.push(csvRow(id(), 'SK01', 'fill_blank',
      `Điền số còn thiếu: ${display}`, `Fill the blank: ${display}`,
      '', correct, 2, 'Xem quy luật tăng dần của dãy số'));
  }

  // Template F: "Số lớn nhất trong A B C?" — diff 2
  const triples = [[1,5,3],[0,4,2],[6,2,8],[3,7,5],[1,9,4],[0,8,3],[5,2,7],[6,4,10],[1,3,6],[2,9,5]];
  for (const [a,b,c] of triples) {
    const correct = Math.max(a,b,c);
    const wrong = [a,b,c].filter(x=>x!==correct);
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Số nào lớn nhất: ${a} ${b} ${c}?`, `Which is the greatest: ${a} ${b} ${c}?`,
      makeOptions(correct,[...wrong,correct-1>0?correct-1:correct+1].slice(0,3)), correct, 2,
      'So sánh từng cặp số với nhau'));
  }

  // Template G: "Số nhỏ nhất trong A B C?" — diff 2
  for (const [a,b,c] of triples) {
    const correct = Math.min(a,b,c);
    const wrong = [a,b,c].filter(x=>x!==correct);
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Số nào nhỏ nhất: ${a} ${b} ${c}?`, `Which is the smallest: ${a} ${b} ${c}?`,
      makeOptions(correct,[...wrong,correct+1].slice(0,3)), correct, 2,
      'Tìm số nhỏ nhất trong 3 số'));
  }

  // Template H: "Sắp xếp tăng dần A B C" — diff 3
  const sortTriples = [[3,1,2],[5,2,4],[8,1,6],[4,9,2],[0,7,3],[6,1,9],[5,3,8],[2,7,4],[10,3,7],[1,8,5]];
  for (const triple of sortTriples) {
    const sorted = [...triple].sort((a,b)=>a-b).join(' ');
    const wrong1 = [...triple].reverse().join(' ');
    const wrong2 = triple.join(' ');
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Sắp xếp tăng dần: ${triple.join(' ')}`, `Sort ascending: ${triple.join(' ')}`,
      `${sorted},${wrong1},${wrong2},${triple[1]} ${triple[0]} ${triple[2]}`, sorted, 3,
      'Số nhỏ nhất đứng đầu tiên'));
  }

  // Template I: "Sắp xếp giảm dần" — diff 3
  for (const triple of sortTriples) {
    const sorted = [...triple].sort((a,b)=>b-a).join(' ');
    const wrong1 = [...triple].sort((a,b)=>a-b).join(' ');
    rows.push(csvRow(id(), 'SK01', 'multiple_choice',
      `Sắp xếp giảm dần: ${triple.join(' ')}`, `Sort descending: ${triple.join(' ')}`,
      `${sorted},${wrong1},${triple.join(' ')},${triple[2]} ${triple[0]} ${triple[1]}`, sorted, 3,
      'Số lớn nhất đứng đầu tiên'));
  }

  // Template J: more fill_blank with diff 3 — complex sequences
  const complexSeqs = [
    [0,2,4,'_',8], [1,3,'_',7,9], ['_',4,6,8,10], [0,3,6,'_',12],
    [10,8,6,'_',2], [9,7,5,'_',1], ['_',6,4,2,0], [2,4,6,8,'_'],
  ];
  for (const seq of complexSeqs) {
    const pos = seq.indexOf('_');
    const step = pos > 0 && pos < seq.length-1
      ? (seq[pos+1] - seq[pos-1]) / 2
      : pos === 0 ? seq[1] - (seq[2]-seq[1]) : seq[pos-1] + (seq[pos-1]-seq[pos-2]);
    const correct = Math.round(seq[pos === 0 ? 1 : pos-1] + (pos === 0 ? -step : step));
    if (correct >= 0 && correct <= 20) {
      rows.push(csvRow(id(), 'SK01', 'fill_blank',
        `Điền số còn thiếu: ${seq.join(' ')}`, `Fill the blank: ${seq.join(' ')}`,
        '', correct, 3, 'Tìm quy luật của dãy số'));
    }
  }

  writeCsv('sk01_number_recognition.csv', rows);
  return rows.length;
}

// ─── SK02 — Nhận biết số 0–100 ──────────────────────────────────────────────
function generateSK02() {
  const rows = [];
  let idx = 1;
  const id = () => `SK02_${String(idx++).padStart(4, '0')}`;

  const numVi = n => {
    const units = ['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín','mười'];
    const tens  = ['','','hai mươi','ba mươi','bốn mươi','năm mươi','sáu mươi','bảy mươi','tám mươi','chín mươi'];
    if (n <= 10) return units[n];
    if (n === 100) return 'một trăm';
    const t = Math.floor(n/10), u = n%10;
    if (t === 1) return u === 0 ? 'mười' : `mười ${units[u]}`;
    return u === 0 ? tens[t] : u === 1 ? `${tens[t]} mốt` : `${tens[t]} ${units[u]}`;
  };

  // Template A: "Số nào là số N?" for N in 11-100, diff 1 (11-50), diff 2 (51-100)
  const numbersAB = [];
  for (let n = 11; n <= 100; n += 3) numbersAB.push(n); // ~30 numbers
  for (const n of numbersAB) {
    const diff = n <= 50 ? 1 : 2;
    const wrong = [n-2, n-1, n+1, n+2].filter(x=>x>0&&x<=100&&x!==n);
    rows.push(csvRow(id(), 'SK02', 'multiple_choice',
      `Số nào là số ${numVi(n)}?`, `Which number is ${n}?`,
      makeOptions(n, shuffle(wrong).slice(0,3)), n, diff,
      `${numVi(n).charAt(0).toUpperCase()+numVi(n).slice(1)} viết là ${n}`));
  }

  // Template B: Fill blank — sequential gaps diff 1/2
  for (let start = 10; start <= 95; start += 5) {
    const seq = [start, start+1, '_', start+3];
    rows.push(csvRow(id(), 'SK02', 'fill_blank',
      `Điền số còn thiếu: ${seq.join(' ')}`, `Fill the blank: ${seq.join(' ')}`,
      '', start+2, start <= 50 ? 1 : 2, `Số đứng giữa ${start+1} và ${start+3}`));
  }

  // Template C: "Số tiếp theo của N?"
  for (let n = 10; n <= 99; n += 4) {
    const diff = n <= 50 ? 1 : 2;
    rows.push(csvRow(id(), 'SK02', 'fill_blank',
      `Số tiếp theo của ${n} là số mấy?`, `What comes after ${n}?`,
      '', n+1, diff, `Cộng thêm 1 vào ${n}`));
  }

  // Template D: "Số liền trước N?"
  for (let n = 11; n <= 100; n += 4) {
    const diff = n <= 50 ? 1 : 2;
    rows.push(csvRow(id(), 'SK02', 'fill_blank',
      `Số liền trước ${n} là số mấy?`, `What comes before ${n}?`,
      '', n-1, diff, `Lấy ${n} trừ đi 1`));
  }

  // Template E: Hàng chục — diff 2
  for (let t = 1; t <= 9; t++) {
    for (let u = 0; u <= 9; u += 3) {
      const n = t*10+u;
      if (n < 11) continue;
      rows.push(csvRow(id(), 'SK02', 'fill_blank',
        `Số có hàng chục là ${t} và hàng đơn vị là ${u} là số mấy?`,
        `Tens digit ${t} and units digit ${u}. What number?`,
        '', n, 2, `${t} chục = ${t*10}, cộng ${u} đơn vị`));
    }
  }

  // Template F: "N có hàng chục là mấy?" — diff 2
  for (let n = 20; n <= 90; n += 10) {
    const t = Math.floor(n/10);
    const wrong = [t-1,t+1,t-2,t+2].filter(x=>x>0&&x<=9);
    rows.push(csvRow(id(), 'SK02', 'multiple_choice',
      `Số ${n} có hàng chục là mấy?`, `What is the tens digit of ${n}?`,
      makeOptions(t, shuffle(wrong).slice(0,3)), t, 2, `${n} = ${t} chục`));
  }

  // Template G: Sort 3 numbers ascending — diff 2
  const triosFor2 = [];
  for (let a = 10; a <= 80; a += 15) {
    for (const [x,y,z] of [[a,a+20,a+10],[a+15,a+5,a+25]]) {
      if (z <= 100) triosFor2.push([x,y,z]);
    }
  }
  for (const trio of triosFor2.slice(0,30)) {
    const sorted = [...trio].sort((a,b)=>a-b).join(' ');
    rows.push(csvRow(id(), 'SK02', 'multiple_choice',
      `Sắp xếp tăng dần: ${trio.join(' ')}`, `Sort ascending: ${trio.join(' ')}`,
      `${sorted},${trio.join(' ')},${[...trio].reverse().join(' ')},${trio[1]} ${trio[0]} ${trio[2]}`,
      sorted, 2, 'Số nhỏ nhất đứng đầu'));
  }

  // Template H: "Số nào lớn hơn A hay B?" — diff 1
  const pairsFor2 = [];
  for (let a = 11; a <= 90; a += 7) {
    const b = a + Math.floor(Math.random()*15)+5;
    if (b <= 100) pairsFor2.push([a,b]);
  }
  for (const [a,b] of pairsFor2.slice(0,25)) {
    rows.push(csvRow(id(), 'SK02', 'multiple_choice',
      `${a} và ${b}: số nào lớn hơn?`, `Which is greater: ${a} or ${b}?`,
      `${a},${b}`, Math.max(a,b), 1, `So sánh chữ số hàng chục trước`));
  }

  // Template I: fill blank in 3-number sort — diff 3
  for (let base = 15; base <= 85; base += 10) {
    const a = base, b = base+8, c = base+16;
    if (c > 100) break;
    rows.push(csvRow(id(), 'SK02', 'fill_blank',
      `Sắp xếp giảm dần: ${c} ${a} ${b}`, `Sort descending: ${c} ${a} ${b}`,
      '', `${c} ${b} ${a}`, 3, 'Số lớn nhất đứng đầu'));
  }

  // Template J: number in range — diff 3
  for (let lo = 40; lo <= 90; lo += 10) {
    const hi = lo + 10;
    const mid = lo + 5;
    rows.push(csvRow(id(), 'SK02', 'multiple_choice',
      `Số nào nằm giữa ${lo} và ${hi}?`, `Which number is between ${lo} and ${hi}?`,
      makeOptions(mid, [lo-2,lo+1,hi-1].filter(x=>x!==mid)), mid, 3,
      `Tìm số lớn hơn ${lo} và nhỏ hơn ${hi}`));
  }

  writeCsv('sk02_number_100.csv', rows);
  return rows.length;
}

// ─── SK03 — Đếm số ──────────────────────────────────────────────────────────
function generateSK03() {
  const rows = [];
  let idx = 1;
  const id = () => `SK03_${String(idx++).padStart(4, '0')}`;

  // Template A: "Số tiếp theo là?" — diff 1
  for (let n = 1; n <= 50; n++) {
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm tiếp: ${n} ?`, `Count on: ${n} ?`,
      '', n+1, n<=15?1:n<=35?2:3, `Cộng thêm 1 vào ${n}`));
  }

  // Template B: Missing in sequence — diff 1/2
  for (let n = 1; n <= 30; n++) {
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Điền số còn thiếu: ${n} _ ${n+2}`, `Fill the blank: ${n} _ ${n+2}`,
      '', n+1, n<=15?1:2, `Số nằm giữa ${n} và ${n+2}`));
  }

  // Template C: Count steps A to B — diff 2
  for (let a = 1; a <= 20; a++) {
    for (const gap of [3,4,5,6]) {
      const b = a + gap;
      if (b > 30) continue;
      const wrong = [gap-1,gap+1,gap+2].filter(x=>x>0&&x!==gap);
      rows.push(csvRow(id(), 'SK03', 'multiple_choice',
        `Có bao nhiêu bước từ ${a} đến ${b}?`, `How many steps from ${a} to ${b}?`,
        makeOptions(gap, shuffle(wrong).slice(0,3)), gap, 2,
        `Đếm từ ${a} đến ${b}: ${Array.from({length:gap+1},(_,i)=>a+i).join(' ')}`));
    }
    if (rows.length > 400) break;
  }

  // Template D: Count by 2 — diff 2
  for (let start = 0; start <= 20; start += 2) {
    const seq = [start, start+2, start+4, '_', start+8];
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm cách 2: ${seq.join(' ')}`, `Count by 2: ${seq.join(' ')}`,
      '', start+6, 2, 'Mỗi bước cộng thêm 2'));
  }

  // Template E: Count by 5 — diff 2
  for (let start = 0; start <= 50; start += 5) {
    const seq = [start, start+5, '_', start+15];
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm cách 5: ${seq.join(' ')}`, `Count by 5: ${seq.join(' ')}`,
      '', start+10, 2, 'Mỗi bước cộng thêm 5'));
  }

  // Template F: Count by 10 — diff 2
  for (let start = 0; start <= 70; start += 10) {
    const seq = [start, start+10, start+20, '_'];
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm cách 10: ${seq.join(' ')}`, `Count by 10: ${seq.join(' ')}`,
      '', start+30, 2, 'Mỗi bước cộng thêm 10'));
  }

  // Template G: Count by 3 — diff 3
  for (let start = 0; start <= 30; start += 3) {
    const seq = [start, start+3, '_', start+9];
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm cách 3: ${seq.join(' ')}`, `Count by 3: ${seq.join(' ')}`,
      '', start+6, 3, 'Mỗi bước cộng thêm 3'));
  }

  // Template H: Countdown — diff 2/3
  for (let n = 10; n <= 30; n += 3) {
    rows.push(csvRow(id(), 'SK03', 'fill_blank',
      `Đếm ngược từ ${n}: ${n} ${n-1} ${n-2} _`, `Count down: ${n} ${n-1} ${n-2} _`,
      '', n-3, n<=20?2:3, `Trừ đi 1 mỗi bước`));
  }

  // Template I: How many numbers between A and B inclusive — diff 3
  for (let a = 1; a <= 20; a++) {
    for (const span of [4,5,6,7]) {
      const b = a + span;
      const count = span + 1;
      const wrong = [count-1,count+1,count+2].filter(x=>x>0&&x!==count);
      rows.push(csvRow(id(), 'SK03', 'multiple_choice',
        `Có bao nhiêu số từ ${a} đến ${b} (kể cả ${a} và ${b})?`,
        `How many numbers from ${a} to ${b} inclusive?`,
        makeOptions(count, shuffle(wrong).slice(0,3)), count, 3,
        `Đếm: ${Array.from({length:count},(_,i)=>a+i).join(' ')}`));
      if (rows.length > 800) break;
    }
    if (rows.length > 800) break;
  }

  writeCsv('sk03_counting.csv', rows);
  return rows.length;
}

// ─── SK04 — So sánh số ──────────────────────────────────────────────────────
function generateSK04() {
  const rows = [];
  let idx = 1;
  const id = () => `SK04_${String(idx++).padStart(4, '0')}`;

  // Template A: "A hay B số nào lớn hơn?" — diff 1 (0-10), diff 2 (11-50), diff 3 (51-100)
  for (let a = 0; a <= 95; a++) {
    for (const gap of [1,2,3,5,8,12]) {
      const b = a + gap;
      if (b > 100) continue;
      const diff = b <= 10 ? 1 : b <= 50 ? 2 : 3;
      rows.push(csvRow(id(), 'SK04', 'multiple_choice',
        `${a} và ${b}: số nào lớn hơn?`, `Which is greater: ${a} or ${b}?`,
        `${a},${b}`, b, diff, `So sánh từng chữ số từ trái sang phải`));
      if (rows.length > 200) break;
    }
    if (rows.length > 200) break;
  }

  // Template B: Fill sign > < = — diff 1/2/3
  const signPairs = [];
  for (let a = 0; a <= 50; a += 2) {
    for (const b of [a-3,a-1,a,a+1,a+4,a+10]) {
      if (b >= 0 && b <= 100) signPairs.push([a,b]);
    }
  }
  for (const [a,b] of shuffle(signPairs).slice(0,200)) {
    const sign = a > b ? '>' : a < b ? '<' : '=';
    const diff = Math.max(a,b) <= 10 ? 1 : Math.max(a,b) <= 50 ? 2 : 3;
    rows.push(csvRow(id(), 'SK04', 'fill_blank',
      `Điền dấu (> < =): ${a} _ ${b}`, `Fill in (> < =): ${a} _ ${b}`,
      '', sign, diff, `${a} ${sign === '>' ? 'lớn hơn' : sign === '<' ? 'nhỏ hơn' : 'bằng'} ${b}`));
  }

  // Template C: Largest of 3 — diff 1/2
  for (let base = 0; base <= 90; base += 3) {
    const [a,b,c] = [base, base + Math.floor(Math.random()*5)+1, base + Math.floor(Math.random()*5)+6];
    if (c > 100) continue;
    const correct = Math.max(a,b,c);
    const wrong = [a,b,c].filter(x=>x!==correct);
    const diff = c <= 10 ? 1 : c <= 50 ? 2 : 3;
    rows.push(csvRow(id(), 'SK04', 'multiple_choice',
      `Số nào lớn nhất: ${a} ${b} ${c}?`, `Greatest of ${a} ${b} ${c}?`,
      makeOptions(correct, [...wrong, correct-1>0?correct-1:correct+1].slice(0,3)), correct, diff,
      `So sánh từng cặp`));
    if (rows.length > 600) break;
  }

  // Template D: Smallest of 3 — diff 1/2
  for (let base = 5; base <= 95; base += 3) {
    const [a,b,c] = [base, base - Math.floor(Math.random()*4)-1, base + Math.floor(Math.random()*6)+2];
    if (b < 0 || c > 100) continue;
    const correct = Math.min(a,b,c);
    const wrong = [a,b,c].filter(x=>x!==correct);
    const diff = Math.max(a,b,c) <= 10 ? 1 : Math.max(a,b,c) <= 50 ? 2 : 3;
    rows.push(csvRow(id(), 'SK04', 'multiple_choice',
      `Số nào nhỏ nhất: ${a} ${b} ${c}?`, `Smallest of ${a} ${b} ${c}?`,
      makeOptions(correct, [...wrong, correct+1].slice(0,3)), correct, diff,
      `Tìm số nhỏ nhất trong 3 số`));
    if (rows.length > 800) break;
  }

  // Template E: Sort 4 numbers ascending — diff 3
  for (let base = 0; base <= 80; base += 5) {
    const nums = [base, base+3, base+7, base+11];
    if (nums[3] > 100) break;
    const sorted = [...nums].sort((a,b)=>a-b).join(' ');
    const shuffled = shuffle(nums);
    rows.push(csvRow(id(), 'SK04', 'multiple_choice',
      `Sắp xếp tăng dần: ${shuffled.join(' ')}`, `Sort ascending: ${shuffled.join(' ')}`,
      `${sorted},${[...nums].reverse().join(' ')},${shuffled.join(' ')},${nums[1]} ${nums[0]} ${nums[2]} ${nums[3]}`,
      sorted, 3, `Số nhỏ nhất đứng trước`));
  }

  writeCsv('sk04_comparison.csv', rows);
  return rows.length;
}

// ─── SK05 — Phép cộng ───────────────────────────────────────────────────────
function generateSK05() {
  const rows = [];
  let idx = 1;
  const id = () => `SK05_${String(idx++).padStart(4, '0')}`;

  const viTemplates = [
    (a,b,c) => [`${a} + ${b} = ?`, `${a} + ${b} = ?`, `Đếm thêm ${b} từ số ${a}`],
    (a,b,c) => [`Tính tổng: ${a} cộng ${b}`, `Calculate: ${a} plus ${b}`, `${a} + ${b} = ?`],
    (a,b,c) => [`Bé có ${a} cái kẹo, được thêm ${b} cái. Bé có tất cả mấy cái?`,
                `${a} candies plus ${b} more. Total?`, `Đếm tất cả kẹo lại`],
  ];

  // Template A: a+b=c multiple choice — diff 1 (sum≤10), diff 2 (sum≤20), diff 3 (sum≤50)
  for (let a = 0; a <= 25; a++) {
    for (let b = 0; b <= 25; b++) {
      const c = a + b;
      if (c > 50) continue;
      const diff = c <= 10 ? 1 : c <= 20 ? 2 : 3;
      const tmpl = viTemplates[idx % viTemplates.length];
      const [qVi, qEn, hint] = tmpl(a, b, c);
      const wrong = uniqueWrongOptions(c, [c-2,c-1,c+1,c+2,c+3].filter(x=>x>=0));
      rows.push(csvRow(id(), 'SK05', 'multiple_choice', qVi, qEn,
        makeOptions(c, wrong.slice(0,3)), c, diff, hint));
      if (rows.length > 600) break;
    }
    if (rows.length > 600) break;
  }

  // Template B: a+_=c fill_blank — diff 1/2/3
  for (let a = 0; a <= 20; a++) {
    for (let b = 1; b <= 20; b++) {
      const c = a + b;
      if (c > 40) continue;
      const diff = c <= 10 ? 1 : c <= 20 ? 2 : 3;
      rows.push(csvRow(id(), 'SK05', 'fill_blank',
        `${a} + _ = ${c}`, `${a} + _ = ${c}`,
        '', b, diff, `Từ ${a} cần thêm mấy để được ${c}?`));
      if (rows.length > 900) break;
    }
    if (rows.length > 900) break;
  }

  // Template C: _+b=c fill_blank
  for (let b = 1; b <= 20; b++) {
    for (let a = 0; a <= 20; a++) {
      const c = a + b;
      if (c > 40) continue;
      const diff = c <= 10 ? 1 : c <= 20 ? 2 : 3;
      rows.push(csvRow(id(), 'SK05', 'fill_blank',
        `_ + ${b} = ${c}`, `_ + ${b} = ${c}`,
        '', a, diff, `Số nào cộng ${b} bằng ${c}?`));
      if (rows.length > 1200) break;
    }
    if (rows.length > 1200) break;
  }

  writeCsv('sk05_addition.csv', rows);
  return rows.length;
}

// ─── SK06 — Phép trừ ────────────────────────────────────────────────────────
function generateSK06() {
  const rows = [];
  let idx = 1;
  const id = () => `SK06_${String(idx++).padStart(4, '0')}`;

  const viTemplates = [
    (a,b,c) => [`${a} - ${b} = ?`, `${a} - ${b} = ?`, `Lấy ${a} bỏ đi ${b} còn lại mấy?`],
    (a,b,c) => [`Tính hiệu: ${a} trừ ${b}`, `Calculate: ${a} minus ${b}`, `${a} - ${b} = ?`],
    (a,b,c) => [`Bé có ${a} cái bánh, ăn mất ${b} cái. Còn lại mấy cái?`,
                `${a} cookies minus ${b} eaten. Left?`, `Đếm số bánh còn lại`],
  ];

  // Template A: a-b=c multiple choice — diff 1 (a≤10), diff 2 (a≤20), diff 3 (a≤50)
  for (let a = 1; a <= 50; a++) {
    for (let b = 0; b <= a; b++) {
      const c = a - b;
      const diff = a <= 10 ? 1 : a <= 20 ? 2 : 3;
      const tmpl = viTemplates[idx % viTemplates.length];
      const [qVi, qEn, hint] = tmpl(a, b, c);
      const wrong = uniqueWrongOptions(c, [c-2,c-1,c+1,c+2,c+3].filter(x=>x>=0));
      rows.push(csvRow(id(), 'SK06', 'multiple_choice', qVi, qEn,
        makeOptions(c, wrong.slice(0,3)), c, diff, hint));
      if (rows.length > 600) break;
    }
    if (rows.length > 600) break;
  }

  // Template B: a-_=c fill_blank
  for (let a = 2; a <= 30; a++) {
    for (let c = 0; c < a; c++) {
      const b = a - c;
      const diff = a <= 10 ? 1 : a <= 20 ? 2 : 3;
      rows.push(csvRow(id(), 'SK06', 'fill_blank',
        `${a} - _ = ${c}`, `${a} - _ = ${c}`,
        '', b, diff, `Lấy ${a} bỏ mấy để còn ${c}?`));
      if (rows.length > 900) break;
    }
    if (rows.length > 900) break;
  }

  // Template C: _-b=c fill_blank
  for (let b = 1; b <= 20; b++) {
    for (let c = 0; c <= 20; c++) {
      const a = c + b;
      if (a > 50) continue;
      const diff = a <= 10 ? 1 : a <= 20 ? 2 : 3;
      rows.push(csvRow(id(), 'SK06', 'fill_blank',
        `_ - ${b} = ${c}`, `_ - ${b} = ${c}`,
        '', a, diff, `Số nào trừ ${b} bằng ${c}?`));
      if (rows.length > 1200) break;
    }
    if (rows.length > 1200) break;
  }

  writeCsv('sk06_subtraction.csv', rows);
  return rows.length;
}

// ─── SK07 — Điền số còn thiếu ───────────────────────────────────────────────
function generateSK07() {
  const rows = [];
  let idx = 1;
  const id = () => `SK07_${String(idx++).padStart(4, '0')}`;

  // Template A: _+b=c (harder, diff 2/3)
  for (let b = 1; b <= 30; b++) {
    for (let c = b; c <= 50; c += 2) {
      const a = c - b;
      if (a < 0) continue;
      const diff = c <= 15 ? 2 : 3;
      const wrong = uniqueWrongOptions(a, [a-2,a-1,a+1,a+2,a+3].filter(x=>x>=0));
      rows.push(csvRow(id(), 'SK07', 'multiple_choice',
        `_ + ${b} = ${c}`, `_ + ${b} = ${c}`,
        makeOptions(a, wrong.slice(0,3)), a, diff, `Số nào cộng ${b} bằng ${c}?`));
      if (rows.length > 200) break;
    }
    if (rows.length > 200) break;
  }

  // Template B: a-_=c
  for (let a = 2; b => true; ) {
    for (let c = 0; c < a; c += 2) {
      const miss = a - c;
      const diff = a <= 15 ? 2 : 3;
      const wrong = uniqueWrongOptions(miss, [miss-2,miss-1,miss+1,miss+2].filter(x=>x>=0));
      rows.push(csvRow(id(), 'SK07', 'multiple_choice',
        `${a} - _ = ${c}`, `${a} - _ = ${c}`,
        makeOptions(miss, wrong.slice(0,3)), miss, diff, `Lấy ${a} bỏ mấy để còn ${c}?`));
      if (rows.length > 400) break;
    }
    a += 3;
    if (a > 50 || rows.length > 400) break;
  }

  // Template C: Number sequences with pattern — diff 2/3
  const patterns = [
    { step: 2, len: 5 }, { step: 3, len: 5 }, { step: 4, len: 4 },
    { step: 5, len: 4 }, { step: 10, len: 4 }, { step: -1, len: 5 },
    { step: -2, len: 5 }, { step: -3, len: 4 },
  ];
  for (const { step, len } of patterns) {
    for (let start = Math.max(0, step < 0 ? Math.abs(step)*len+2 : 1); start <= 40; start += Math.abs(step)) {
      const seq = Array.from({ length: len }, (_, i) => start + i * step);
      if (seq.some(x => x < 0 || x > 100)) continue;
      const blankPos = Math.floor(Math.random() * len);
      const correct = seq[blankPos];
      const display = seq.map((v, i) => i === blankPos ? '_' : v).join(' ');
      const diff = Math.max(...seq.map(Math.abs)) <= 20 ? 2 : 3;
      rows.push(csvRow(id(), 'SK07', 'fill_blank',
        `Điền số còn thiếu: ${display}`, `Fill the blank: ${display}`,
        '', correct, diff, `Quy luật: mỗi bước ${step > 0 ? 'cộng' : 'trừ'} ${Math.abs(step)}`));
      if (rows.length > 700) break;
    }
    if (rows.length > 700) break;
  }

  // Template D: a+b=_ (two-step reasoning, diff 3)
  for (let a = 5; a <= 25; a += 2) {
    for (const b of [a-3, a+2, a+5]) {
      if (b <= 0) continue;
      const c = a + b;
      if (c > 60) continue;
      rows.push(csvRow(id(), 'SK07', 'fill_blank',
        `Nếu ${a} + ${b} = _ thì _ - ${b} = ?`,
        `If ${a} + ${b} = _ then _ - ${b} = ?`,
        '', a, 3, `Tính ${a}+${b} trước rồi trừ ngược lại`));
      if (rows.length > 900) break;
    }
    if (rows.length > 900) break;
  }

  // Template E: Double — diff 3
  for (let n = 1; n <= 25; n++) {
    const c = n * 2;
    rows.push(csvRow(id(), 'SK07', 'fill_blank',
      `_ + _ = ${c} (hai số bằng nhau)`, `_ + _ = ${c} (both equal)`,
      '', n, 3, `Số nào cộng chính nó bằng ${c}?`));
  }

  writeCsv('sk07_missing_number.csv', rows);
  return rows.length;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
console.log('\n🎯 Generating question bank...\n');
const counts = {
  SK01: generateSK01(),
  SK02: generateSK02(),
  SK03: generateSK03(),
  SK04: generateSK04(),
  SK05: generateSK05(),
  SK06: generateSK06(),
  SK07: generateSK07(),
};
const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`\n✅ Total: ${total} câu hỏi`);
console.log(Object.entries(counts).map(([k,v]) => `   ${k}: ${v}`).join('\n'));
