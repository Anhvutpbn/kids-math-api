/**
 * Generates question bank programmatically for SK03–SK08.
 */

interface GeneratedQuestion {
  id: string;
  skillId: string;
  type: string;
  questionVi: string;
  questionEn: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  hintVi: string;
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pad(n: number): string { return String(n); }

function uniqueWrongs(correct: number, count: number, min = 0, max = 9999): number[] {
  const result: number[] = [];
  let spread = 1;
  while (result.length < count) {
    for (const delta of [-spread, spread]) {
      const w = correct + delta;
      if (w !== correct && w >= min && w <= max && !result.includes(w)) result.push(w);
      if (result.length >= count) break;
    }
    spread++;
    if (spread > 10000) break;
  }
  return result.slice(0, count);
}

function makeOpts(correct: number, wrongs: number[]): string[] {
  return shuffleArr([correct, ...wrongs.slice(0, 3)]).map(pad);
}

// ─── SK03: Đếm số — 100 câu ───────────────────────────────────────────────
// D1 (40): đếm tiếp 0-39 (+1)
// D2 (35): đếm tiếp 40-74 (+1) + step-2 sequences
// D3 (25): đếm lùi + step-5/10
export function generateSK03(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK03_${String(idx++).padStart(4, '0')}`;

  // D1: next in +1 sequence from 0 to 39 → 40 questions
  for (let n = 0; n < 40; n++) {
    const ans = n + 2;
    const w = uniqueWrongs(ans, 3, 0, 50);
    qs.push({
      id: qid(), skillId: 'SK03', type: 'multiple_choice',
      questionVi: `${n}, ${n + 1}, ___ tiếp theo?`,
      questionEn: `${n}, ${n + 1}, ___ what comes next?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: 1,
      hintVi: `${n + 1} + 1 = ${ans}`,
    });
  }

  // D2: next in +1 sequence from 40 to 70 = 31 questions; rest +2 step
  for (let n = 40; n <= 70 && qs.filter((q) => q.difficulty === 2).length < 25; n++) {
    const ans = n + 2;
    const w = uniqueWrongs(ans, 3, 0, 100);
    qs.push({
      id: qid(), skillId: 'SK03', type: 'multiple_choice',
      questionVi: `${n}, ${n + 1}, ___ tiếp theo?`,
      questionEn: `${n}, ${n + 1}, ___ what comes next?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: 2,
      hintVi: `${n + 1} + 1 = ${ans}`,
    });
  }
  // D2: step-2 sequences to fill up to 35
  for (let n = 2; qs.filter((q) => q.difficulty === 2).length < 35; n += 2) {
    const a = n - 2, b = n, ans = n + 2;
    const w = uniqueWrongs(ans, 3, 0, 100);
    qs.push({
      id: qid(), skillId: 'SK03', type: 'multiple_choice',
      questionVi: `${a}, ${b}, ___ tiếp theo (bước 2)?`,
      questionEn: `${a}, ${b}, ___ next (step +2)?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: 2,
      hintVi: `${b} + 2 = ${ans}`,
    });
    if (n > 98) break;
  }

  // D3: count backwards (12) + step-5 (13)
  const backStarts = [10,15,20,25,30,35,40,50,60,70,80,90];
  for (const n of backStarts) {
    if (qs.filter((q) => q.difficulty === 3).length >= 12) break;
    const ans = n - 2;
    const w = uniqueWrongs(ans, 3, 0, 100);
    qs.push({
      id: qid(), skillId: 'SK03', type: 'multiple_choice',
      questionVi: `${n}, ${n - 1}, ___ đếm lùi?`,
      questionEn: `${n}, ${n - 1}, ___ count back?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: 3,
      hintVi: `${n - 1} - 1 = ${ans}`,
    });
  }
  // step-5
  for (let n = 5; qs.filter((q) => q.difficulty === 3).length < 25; n += 5) {
    const a = n - 5, b = n, ans = n + 5;
    if (ans > 100) break;
    const w = uniqueWrongs(ans, 3, 0, 120);
    qs.push({
      id: qid(), skillId: 'SK03', type: 'multiple_choice',
      questionVi: `${a}, ${b}, ___ tiếp theo (bước 5)?`,
      questionEn: `${a}, ${b}, ___ next (step +5)?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: 3,
      hintVi: `${b} + 5 = ${ans}`,
    });
  }

  return qs.slice(0, 100);
}

// ─── SK04: So sánh số — 200 câu ───────────────────────────────────────────
// D1 (70): cả 2 trong 0-50
// D2 (70): cả 2 trong 51-500
// D3 (60): cả 2 trong 501-9999
export function generateSK04(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK04_${String(idx++).padStart(4, '0')}`;

  function cmp(a: number, b: number, diff: number) {
    const sym = a < b ? '<' : a > b ? '>' : '=';
    qs.push({
      id: qid(), skillId: 'SK04', type: 'multiple_choice',
      questionVi: `${a} ___ ${b}: điền dấu so sánh`,
      questionEn: `${a} ___ ${b}: fill > < or =`,
      options: ['>', '<', '='],
      correctAnswer: sym, difficulty: diff,
      hintVi: `So sánh ${a} với ${b}`,
    });
  }

  function fillLevel(diff: number, lo: number, hi: number, target: number) {
    const used = new Set<string>();
    let attempts = 0;
    while (qs.filter((q) => q.difficulty === diff).length < target && attempts < 100000) {
      attempts++;
      const a = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      const b = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      const key = a <= b ? `${a},${b}` : `${b},${a}`;
      if (!used.has(key)) { used.add(key); cmp(a, b, diff); }
    }
  }

  fillLevel(1, 0, 50, 70);
  fillLevel(2, 51, 500, 70);
  fillLevel(3, 501, 9999, 60);

  return qs;
}

// ─── SK05: Phép cộng — 150 câu (vertical_arithmetic) ─────────────────────
// D1 (50): a+b ≤ 10, blank = result
// D2 (55): 10 < a+b ≤ 50, blank = result
// D3 (45): 50 < a+b ≤ 100, blank = random operand
export function generateSK05(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK05_${String(idx++).padStart(4, '0')}`;

  function addResult(a: number, b: number, diff: number) {
    const ans = a + b;
    const w = uniqueWrongs(ans, 3, 0, 110);
    qs.push({
      id: qid(), skillId: 'SK05', type: 'vertical_arithmetic',
      questionVi: `${a} + ${b} = ?`,
      questionEn: `${a} + ${b} = ?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: diff,
      hintVi: `${a} cộng ${b} bằng ${ans}`,
    });
  }

  function addOperand(a: number, b: number, diff: number) {
    const sum = a + b;
    if (Math.random() < 0.5) {
      // blank op1: "? + b = sum"
      const w = uniqueWrongs(a, 3, 1, sum - 1);
      qs.push({
        id: qid(), skillId: 'SK05', type: 'vertical_arithmetic',
        questionVi: `? + ${b} = ${sum}`,
        questionEn: `? + ${b} = ${sum}`,
        options: makeOpts(a, w),
        correctAnswer: pad(a), difficulty: diff,
        hintVi: `${sum} trừ ${b} bằng ${a}`,
      });
    } else {
      // blank op2: "a + ? = sum"
      const w = uniqueWrongs(b, 3, 1, sum - 1);
      qs.push({
        id: qid(), skillId: 'SK05', type: 'vertical_arithmetic',
        questionVi: `${a} + ? = ${sum}`,
        questionEn: `${a} + ? = ${sum}`,
        options: makeOpts(b, w),
        correctAnswer: pad(b), difficulty: diff,
        hintVi: `${sum} trừ ${a} bằng ${b}`,
      });
    }
  }

  // D1: all pairs where a+b <= 10, result blank
  const d1All: [number, number][] = [];
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 10 - a; b++) d1All.push([a, b]);
  shuffleArr(d1All).slice(0, 50).forEach(([a, b]) => addResult(a, b, 1));

  // D2: 10 < a+b <= 50, result blank
  const used2 = new Set<string>();
  let att = 0;
  while (qs.filter((q) => q.difficulty === 2).length < 55 && att < 100000) {
    att++;
    const a = Math.floor(Math.random() * 49) + 1;
    const b = Math.floor(Math.random() * 49) + 1;
    if (a + b > 10 && a + b <= 50) {
      const k = `${Math.min(a,b)},${Math.max(a,b)}`;
      if (!used2.has(k)) { used2.add(k); addResult(a, b, 2); }
    }
  }

  // D3: 50 < a+b <= 100, blank = random operand
  const used3 = new Set<string>();
  att = 0;
  while (qs.filter((q) => q.difficulty === 3).length < 45 && att < 100000) {
    att++;
    const a = Math.floor(Math.random() * 49) + 2;
    const b = Math.floor(Math.random() * 49) + 2;
    if (a + b > 50 && a + b <= 100) {
      const k = `${Math.min(a,b)},${Math.max(a,b)}`;
      if (!used3.has(k)) { used3.add(k); addOperand(a, b, 3); }
    }
  }

  return qs.slice(0, 150);
}

// ─── SK06: Phép trừ — 150 câu (vertical_arithmetic) ─────────────────────
// D1 (50): a ≤ 10, blank = result
// D2 (55): 10 < a ≤ 50, blank = result
// D3 (45): 50 < a ≤ 100, blank = random operand
export function generateSK06(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK06_${String(idx++).padStart(4, '0')}`;

  function subResult(a: number, b: number, diff: number) {
    const ans = a - b;
    const w = uniqueWrongs(ans, 3, 0, a);
    qs.push({
      id: qid(), skillId: 'SK06', type: 'vertical_arithmetic',
      questionVi: `${a} - ${b} = ?`,
      questionEn: `${a} - ${b} = ?`,
      options: makeOpts(ans, w),
      correctAnswer: pad(ans), difficulty: diff,
      hintVi: `${a} trừ ${b} bằng ${ans}`,
    });
  }

  function subOperand(a: number, b: number, diff: number) {
    const result = a - b;
    if (Math.random() < 0.5) {
      // blank op1: "? - b = result"
      const w = uniqueWrongs(a, 3, b + 1, a + 10);
      qs.push({
        id: qid(), skillId: 'SK06', type: 'vertical_arithmetic',
        questionVi: `? - ${b} = ${result}`,
        questionEn: `? - ${b} = ${result}`,
        options: makeOpts(a, w),
        correctAnswer: pad(a), difficulty: diff,
        hintVi: `${result} cộng ${b} bằng ${a}`,
      });
    } else {
      // blank op2: "a - ? = result"
      const w = uniqueWrongs(b, 3, 0, a - 1);
      qs.push({
        id: qid(), skillId: 'SK06', type: 'vertical_arithmetic',
        questionVi: `${a} - ? = ${result}`,
        questionEn: `${a} - ? = ${result}`,
        options: makeOpts(b, w),
        correctAnswer: pad(b), difficulty: diff,
        hintVi: `${a} trừ ${result} bằng ${b}`,
      });
    }
  }

  // D1: all pairs a<=10, b<=a, b>=1
  const d1All: [number, number][] = [];
  for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) d1All.push([a, b]);
  shuffleArr(d1All).slice(0, 50).forEach(([a, b]) => subResult(a, b, 1));

  // D2: 10 < a <= 50, result blank
  const used2 = new Set<string>();
  let att = 0;
  while (qs.filter((q) => q.difficulty === 2).length < 55 && att < 100000) {
    att++;
    const a = Math.floor(Math.random() * 40) + 11;
    const b = Math.floor(Math.random() * (a - 1)) + 1;
    const k = `${a}-${b}`;
    if (!used2.has(k)) { used2.add(k); subResult(a, b, 2); }
  }

  // D3: 50 < a <= 100, blank = random operand
  const used3 = new Set<string>();
  att = 0;
  while (qs.filter((q) => q.difficulty === 3).length < 45 && att < 100000) {
    att++;
    const a = Math.floor(Math.random() * 49) + 52;
    const b = Math.floor(Math.random() * (a - 2)) + 1;
    const k = `${a}-${b}`;
    if (!used3.has(k)) { used3.add(k); subOperand(a, b, 3); }
  }

  return qs.slice(0, 150);
}

// ─── SK07: Điền số còn thiếu — 150 câu ────────────────────────────────────
// D1 (50): ___ + b = c, c ≤ 10
// D2 (55): a + ___ = c, 10 < c ≤ 50
// D3 (45): a - ___ = c, 50 < a ≤ 100
export function generateSK07(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK07_${String(idx++).padStart(4, '0')}`;

  // D1: ___ + b = c, c 1..10
  const d1All: [number, number, number][] = [];
  for (let c = 1; c <= 10; c++) for (let b = 0; b <= c; b++) d1All.push([c - b, b, c]);
  shuffleArr(d1All).slice(0, 50).forEach(([a, b, c]) => {
    const w = uniqueWrongs(a, 3, 0, 10);
    qs.push({
      id: qid(), skillId: 'SK07', type: 'multiple_choice',
      questionVi: `___ + ${b} = ${c}`,
      questionEn: `___ + ${b} = ${c}`,
      options: makeOpts(a, w),
      correctAnswer: pad(a), difficulty: 1,
      hintVi: `${c} - ${b} = ${a}`,
    });
  });

  // D2: a + ___ = c, 10 < c <= 50
  const used2 = new Set<string>();
  let att = 0;
  while (qs.filter((q) => q.difficulty === 2).length < 55 && att < 100000) {
    att++;
    const c = Math.floor(Math.random() * 40) + 11;
    const a = Math.floor(Math.random() * (c - 1)) + 1;
    const b = c - a;
    const k = `${a}+${b}`;
    if (b > 0 && !used2.has(k)) {
      used2.add(k);
      const w = uniqueWrongs(b, 3, 0, 50);
      qs.push({
        id: qid(), skillId: 'SK07', type: 'multiple_choice',
        questionVi: `${a} + ___ = ${c}`,
        questionEn: `${a} + ___ = ${c}`,
        options: makeOpts(b, w),
        correctAnswer: pad(b), difficulty: 2,
        hintVi: `${c} - ${a} = ${b}`,
      });
    }
  }

  // D3: a - ___ = c, 50 < a <= 100
  const used3 = new Set<string>();
  att = 0;
  while (qs.filter((q) => q.difficulty === 3).length < 45 && att < 100000) {
    att++;
    const a = Math.floor(Math.random() * 50) + 51;
    const c = Math.floor(Math.random() * a);
    const b = a - c;
    const k = `${a}-${b}`;
    if (b > 0 && !used3.has(k)) {
      used3.add(k);
      const w = uniqueWrongs(b, 3, 0, 100);
      qs.push({
        id: qid(), skillId: 'SK07', type: 'multiple_choice',
        questionVi: `${a} - ___ = ${c}`,
        questionEn: `${a} - ___ = ${c}`,
        options: makeOpts(b, w),
        correctAnswer: pad(b), difficulty: 3,
        hintVi: `${a} - ${c} = ${b}`,
      });
    }
  }

  return qs.slice(0, 150);
}

// ─── SK08: Chọn min/max — 300 câu ─────────────────────────────────────────
// D1 (100): 4 số trong 0-20
// D2 (100): 4 số trong 0-50
// D3 (100): 4 số trong 0-100
export function generateSK08(): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];
  let idx = 1;
  const qid = () => `SK08_${String(idx++).padStart(4, '0')}`;

  function fillLevel(maxVal: number, perDiff: number, diff: number) {
    const used = new Set<string>();
    let attempts = 0;
    while (qs.filter((q) => q.difficulty === diff).length < perDiff && attempts < 200000) {
      attempts++;
      const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * (maxVal + 1)));
      if (new Set(nums).size < 4) continue;
      const sorted = [...nums].sort((a, b) => a - b);
      const key = sorted.join(',');
      if (used.has(key)) continue;
      used.add(key);
      const minV = sorted[0], maxV = sorted[3];
      // push min question
      if (qs.filter((q) => q.difficulty === diff).length < perDiff) {
        qs.push({
          id: qid(), skillId: 'SK08', type: 'min_max',
          questionVi: 'Chọn số BÉ nhất',
          questionEn: 'Choose the smallest number',
          options: shuffleArr([...nums]).map(pad),
          correctAnswer: pad(minV), difficulty: diff,
          hintVi: `Số bé nhất là ${minV}`,
        });
      }
      // push max question
      if (qs.filter((q) => q.difficulty === diff).length < perDiff) {
        qs.push({
          id: qid(), skillId: 'SK08', type: 'min_max',
          questionVi: 'Chọn số LỚN nhất',
          questionEn: 'Choose the largest number',
          options: shuffleArr([...nums]).map(pad),
          correctAnswer: pad(maxV), difficulty: diff,
          hintVi: `Số lớn nhất là ${maxV}`,
        });
      }
    }
  }

  fillLevel(20, 100, 1);
  fillLevel(50, 100, 2);
  fillLevel(100, 100, 3);

  return qs.slice(0, 300);
}

export const EXPECTED_GENERATED_COUNT = 100 + 200 + 150 + 150 + 150 + 300; // = 1050
