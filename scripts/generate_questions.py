"""
Generate CSV data for Kids Math Learning App.
Replaces all old question CSVs with fresh, well-designed question sets.

Skills:
  SK01 - Nhận biết số 0-10       (~44 questions)
  SK02 - Nhận biết số 0-100      (~70 questions)
  SK03 - Đếm số                  (~65 questions)
  SK04 - So sánh số 0-99999      (~85 questions)
  SK05 - Phép cộng trong p/vi 100 (~80 questions)
  SK06 - Phép trừ trong p/vi 100 (~80 questions)
  SK07 - Điền số còn thiếu       (~70 questions)
  SK08 - Số lớn/bé nhất ≤ 1000  (~80 questions)
"""

import csv
import random
import os

random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
QUESTIONS_DIR = os.path.join(DATA_DIR, 'questions')


def write_csv(filepath, rows):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'skill_id', 'type', 'question_vi', 'question_en',
                         'options', 'correct_answer', 'difficulty', 'hint_vi'])
        writer.writerows(rows)
    print(f"  Wrote {len(rows)} rows -> {os.path.basename(filepath)}")


def pick4(correct, pool, rng=None):
    """Return (options_str, correct_str) with 4 shuffled options including correct."""
    r = rng or random
    others = [x for x in pool if str(x) != str(correct)]
    sample = r.sample(others, min(3, len(others)))
    while len(sample) < 3:
        # fallback if pool too small
        sample.append(str(int(correct) + len(sample) + 1))
    opts = [str(correct)] + [str(x) for x in sample]
    r.shuffle(opts)
    return ','.join(opts), str(correct)


# ─────────────────────────────────────────────────────────
# SK01  Nhận biết số 0-10
# ─────────────────────────────────────────────────────────
def gen_sk01():
    rows = []
    idx = 1
    pool = list(range(0, 11))

    # Type A: Số nào đây là số N?  (0-10, 11 questions)
    for n in range(0, 11):
        opts, ans = pick4(n, pool)
        diff = 1 if n <= 5 else 2
        rows.append([f'SK01_{idx:04d}', 'SK01', 'multiple_choice',
                     f'Số nào đây là số {n}?', f'Which one is number {n}?',
                     opts, ans, diff, f'Số {n}'])
        idx += 1

    # Type B: Số nào đứng TRƯỚC số N?  (1-10, 10 questions)
    for n in range(1, 11):
        correct = n - 1
        opts, ans = pick4(correct, pool)
        diff = 1 if n <= 6 else 2
        rows.append([f'SK01_{idx:04d}', 'SK01', 'multiple_choice',
                     f'Số nào đứng TRƯỚC số {n}?', f'Which number comes BEFORE {n}?',
                     opts, ans, diff, f'Số trước {n} là {n-1}'])
        idx += 1

    # Type C: Số nào đứng SAU số N?  (0-9, 10 questions)
    for n in range(0, 10):
        correct = n + 1
        opts, ans = pick4(correct, pool)
        diff = 1 if n <= 4 else 2
        rows.append([f'SK01_{idx:04d}', 'SK01', 'multiple_choice',
                     f'Số nào đứng SAU số {n}?', f'Which number comes AFTER {n}?',
                     opts, ans, diff, f'Số sau {n} là {n+1}'])
        idx += 1

    # Type D: Điền số tiếp theo trong dãy  (8 questions)
    seqs = [(0,1,2), (1,2,3), (2,3,4), (3,4,5),
            (4,5,6), (5,6,7), (6,7,8), (7,8,9), (8,9,10)]
    for a, b, c in seqs:
        opts, ans = pick4(c, pool)
        rows.append([f'SK01_{idx:04d}', 'SK01', 'multiple_choice',
                     f'{a}, {b}, ___ tiếp theo là số nào?',
                     f'{a}, {b}, ___ what comes next?',
                     opts, ans, 2, f'Cộng thêm 1 vào {b}'])
        idx += 1

    return rows


# ─────────────────────────────────────────────────────────
# SK02  Nhận biết số 0-100
# ─────────────────────────────────────────────────────────
def gen_sk02():
    rows = []
    idx = 1

    # Key numbers to cover
    key = list(range(0, 21))                                   # 0-20 full
    key += list(range(25, 101, 5))                             # 25,30,...100
    key += [22, 23, 27, 28, 32, 33, 37, 38, 42, 43, 47, 48,   # gaps in 20-50
            52, 53, 57, 58, 62, 63, 67, 68, 72, 73, 77, 78,
            82, 83, 87, 88, 92, 93, 97, 98]
    key = sorted(set(key))

    def make_pool(n):
        lo = max(0, n - 15)
        hi = min(100, n + 15)
        p = list(range(lo, hi + 1))
        p = [x for x in p if x != n]
        if len(p) < 3:
            p += [n + 20, n + 30, n - 20]
        return p

    # Type A: Số nào đây là số N?
    for n in key:
        p = make_pool(n)
        opts, ans = pick4(n, p)
        diff = 1 if n < 20 else (2 if n < 50 else 3)
        rows.append([f'SK02_{idx:04d}', 'SK02', 'multiple_choice',
                     f'Số nào đây là số {n}?', f'Which one is number {n}?',
                     opts, ans, diff, f'Đây là số {n}'])
        idx += 1

    # Type B: Số đứng trước số N (multiples of 10)
    for n in [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]:
        correct = n - 1
        p = [n-3, n-2, n+1, n+2, n-5]
        p = [x for x in p if 0 <= x <= 100 and x != correct]
        opts, ans = pick4(correct, p)
        rows.append([f'SK02_{idx:04d}', 'SK02', 'multiple_choice',
                     f'Số nào đứng TRƯỚC số {n}?', f'Which number comes BEFORE {n}?',
                     opts, ans, 2, f'Số trước {n} là {n-1}'])
        idx += 1

    # Type C: Số đứng sau số N (multiples of 10)
    for n in [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]:
        correct = n + 1
        p = [n+2, n+3, n-1, n+5, n+10]
        p = [x for x in p if 0 <= x <= 100 and x != correct]
        opts, ans = pick4(correct, p)
        rows.append([f'SK02_{idx:04d}', 'SK02', 'multiple_choice',
                     f'Số nào đứng SAU số {n}?', f'Which number comes AFTER {n}?',
                     opts, ans, 2, f'Số sau {n} là {n+1}'])
        idx += 1

    return rows


# ─────────────────────────────────────────────────────────
# SK03  Đếm số
# ─────────────────────────────────────────────────────────
def gen_sk03():
    rows = []
    idx = 1

    def q(question_vi, question_en, correct, pool, diff, hint):
        nonlocal idx
        opts, ans = pick4(correct, pool)
        rows.append([f'SK03_{idx:04d}', 'SK03', 'multiple_choice',
                     question_vi, question_en, opts, ans, diff, hint])
        idx += 1

    # Đếm tiếp bước 1 (1→20)
    for start in range(1, 21):
        correct = start + 1
        pool = list(range(max(0, start - 2), start + 6))
        pool = [x for x in pool if x != correct]
        diff = 1 if start <= 10 else 2
        q(f'{start - 1}, {start}, ___ tiếp theo?',
          f'{start - 1}, {start}, ___ what comes next?',
          correct, pool, diff, f'Cộng thêm 1 vào {start}')

    # Đếm tiếp bước 2 (even)
    for start in [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]:
        correct = start + 2
        pool = [start - 2, start - 1, start + 1, start + 3, start + 4]
        pool = [x for x in pool if x >= 0 and x != correct]
        q(f'{start - 2}, {start}, ___ (bước nhảy 2)?',
          f'{start - 2}, {start}, ___ (count by 2)?',
          correct, pool, 2, f'Cộng thêm 2 vào {start}')

    # Đếm tiếp bước 5
    for start in [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]:
        correct = start + 5
        pool = [start + 1, start + 2, start + 3, start + 4, start + 6, start + 10]
        q(f'{start - 5}, {start}, ___ (bước nhảy 5)?',
          f'{start - 5}, {start}, ___ (count by 5)?',
          correct, pool, 2, f'Cộng thêm 5 vào {start}')

    # Đếm tiếp bước 10
    for start in [10, 20, 30, 40, 50, 60, 70, 80]:
        correct = start + 10
        pool = [start + 1, start + 5, start + 8, start + 11, start + 20]
        q(f'{start - 10}, {start}, ___ (bước nhảy 10)?',
          f'{start - 10}, {start}, ___ (count by 10)?',
          correct, pool, 2, f'Cộng thêm 10 vào {start}')

    # Đếm lùi bước 1
    for start in range(10, 0, -1):
        correct = start - 1
        pool = list(range(max(0, start - 5), start + 3))
        pool = [x for x in pool if x != correct]
        q(f'{start + 1}, {start}, ___ đếm lùi?',
          f'{start + 1}, {start}, ___ count down?',
          correct, pool, 2, f'Trừ đi 1 từ {start}')

    # Đếm lùi bước 2
    for start in [10, 12, 14, 16, 18, 20, 8, 6]:
        correct = start - 2
        pool = [start - 4, start - 3, start - 1, start + 1, start + 2]
        pool = [x for x in pool if x >= 0 and x != correct]
        q(f'{start + 2}, {start}, ___ đếm lùi bước 2?',
          f'{start + 2}, {start}, ___ count back by 2?',
          correct, pool, 3, f'Trừ đi 2 từ {start}')

    return rows


# ─────────────────────────────────────────────────────────
# SK04  So sánh số 0-99999
# ─────────────────────────────────────────────────────────
def gen_sk04():
    rows = []
    idx = 1

    # Options for all comparison questions are the 3 symbols
    SYM_OPTS = '>,<,='

    def cmp_row(a, b, diff):
        nonlocal idx
        if a > b:
            correct = '>'
        elif a < b:
            correct = '<'
        else:
            correct = '='
        rows.append([f'SK04_{idx:04d}', 'SK04', 'multiple_choice',
                     f'{a} ___ {b}: điền dấu so sánh',
                     f'{a} ___ {b}: fill in >, < or =',
                     SYM_OPTS, correct, diff,
                     f'So sánh {a} với {b}'])
        idx += 1

    # Level 1: single digit 0-9 (all unique pairs a<b + a=b cases)
    for a in range(0, 10):
        for b in range(a + 1, 10):
            cmp_row(a, b, 1)
            cmp_row(b, a, 1)
    # equal cases single digit
    for n in [0, 2, 4, 6, 8]:
        cmp_row(n, n, 1)

    # Level 2: two-digit 10-99
    pairs_l2 = [
        (15, 23), (45, 38), (67, 67), (82, 19), (50, 55), (33, 33),
        (71, 48), (26, 62), (99, 89), (13, 31), (44, 44), (77, 88),
        (60, 6), (9, 90), (18, 81), (55, 45), (72, 27), (36, 63),
        (48, 84), (11, 99), (50, 50), (25, 52), (14, 41), (66, 68),
        (37, 73), (85, 58), (100, 99),
    ]
    for a, b in pairs_l2:
        cmp_row(a, b, 2)

    # Level 3: three-digit 100-999
    pairs_l3 = [
        (123, 321), (456, 456), (789, 799), (100, 99), (500, 500),
        (234, 243), (999, 998), (301, 310), (150, 105), (725, 527),
        (400, 404), (888, 888), (200, 201), (999, 1000), (350, 350),
        (612, 621), (175, 157), (840, 480),
    ]
    for a, b in pairs_l3:
        cmp_row(a, b, 3)

    # Level 4: four-digit 1000-9999
    pairs_l4 = [
        (1234, 1243), (5678, 5678), (9999, 9998), (1000, 999),
        (3456, 6543), (2500, 2500), (7777, 7778), (4321, 1234),
        (1010, 1001), (8888, 8880), (5000, 5000), (2222, 2221),
    ]
    for a, b in pairs_l4:
        cmp_row(a, b, 4)

    # Level 5: five-digit 10000-99999
    pairs_l5 = [
        (12345, 12354), (50000, 50000), (99999, 99998), (10000, 9999),
        (34567, 34576), (75000, 57000), (23456, 23456), (88888, 88889),
        (10001, 10010), (99990, 99909),
    ]
    for a, b in pairs_l5:
        cmp_row(a, b, 5)

    return rows


# ─────────────────────────────────────────────────────────
# SK05  Phép cộng trong phạm vi 100
# ─────────────────────────────────────────────────────────
def gen_sk05():
    rows = []
    idx = 1

    def add_row(a, b, diff):
        nonlocal idx
        correct = a + b
        # Plausible distractors: ±1, ±2 from correct
        d_pool = [correct - 2, correct - 1, correct + 1, correct + 2,
                  correct + 3, correct - 3]
        d_pool = [x for x in d_pool if x >= 0 and x != correct]
        distractors = random.sample(d_pool, min(3, len(d_pool)))
        while len(distractors) < 3:
            distractors.append(correct + len(distractors) + 1)
        opts = [str(correct)] + [str(x) for x in distractors]
        random.shuffle(opts)
        rows.append([f'SK05_{idx:04d}', 'SK05', 'multiple_choice',
                     f'{a} + {b} = ?', f'{a} + {b} = ?',
                     ','.join(opts), str(correct), diff,
                     f'{a} cộng {b} bằng {correct}'])
        idx += 1

    # Level 1: a+b ≤ 10 (both ≤ 9)
    pairs_l1 = [(a, b) for a in range(0, 10) for b in range(0, 10) if a + b <= 10]
    random.shuffle(pairs_l1)
    for a, b in pairs_l1[:25]:
        add_row(a, b, 1)

    # Level 2: 11 ≤ a+b ≤ 20
    pairs_l2 = [(a, b) for a in range(1, 20) for b in range(1, 20)
                if 10 < a + b <= 20 and a <= b]
    random.shuffle(pairs_l2)
    for a, b in pairs_l2[:20]:
        add_row(a, b, 2)

    # Level 3: 21 ≤ a+b ≤ 50
    pairs_l3 = [(a, b) for a in range(5, 46) for b in range(5, 46)
                if 20 < a + b <= 50 and a <= b]
    random.shuffle(pairs_l3)
    for a, b in pairs_l3[:20]:
        add_row(a, b, 3)

    # Level 4: 51 ≤ a+b ≤ 100
    pairs_l4 = [(a, b) for a in range(10, 90) for b in range(10, 90)
                if 50 < a + b <= 100 and a <= b]
    random.shuffle(pairs_l4)
    for a, b in pairs_l4[:20]:
        add_row(a, b, 4)

    return rows


# ─────────────────────────────────────────────────────────
# SK06  Phép trừ trong phạm vi 100
# ─────────────────────────────────────────────────────────
def gen_sk06():
    rows = []
    idx = 1

    def sub_row(a, b, diff):
        nonlocal idx
        correct = a - b
        d_pool = [correct - 2, correct - 1, correct + 1, correct + 2,
                  correct + 3, correct - 3]
        d_pool = [x for x in d_pool if x >= 0 and x != correct]
        distractors = random.sample(d_pool, min(3, len(d_pool)))
        while len(distractors) < 3:
            distractors.append(correct + len(distractors) + 1)
        opts = [str(correct)] + [str(x) for x in distractors]
        random.shuffle(opts)
        rows.append([f'SK06_{idx:04d}', 'SK06', 'multiple_choice',
                     f'{a} - {b} = ?', f'{a} - {b} = ?',
                     ','.join(opts), str(correct), diff,
                     f'{a} trừ {b} bằng {correct}'])
        idx += 1

    # Level 1: a ≤ 10, b ≤ a
    pairs_l1 = [(a, b) for a in range(1, 11) for b in range(0, a + 1)]
    random.shuffle(pairs_l1)
    for a, b in pairs_l1[:25]:
        sub_row(a, b, 1)

    # Level 2: 11 ≤ a ≤ 20
    pairs_l2 = [(a, b) for a in range(11, 21) for b in range(1, a + 1)]
    random.shuffle(pairs_l2)
    for a, b in pairs_l2[:20]:
        sub_row(a, b, 2)

    # Level 3: 21 ≤ a ≤ 50
    pairs_l3 = [(a, b) for a in range(21, 51) for b in range(1, a + 1)
                if a - b >= 0]
    random.shuffle(pairs_l3)
    for a, b in pairs_l3[:20]:
        sub_row(a, b, 3)

    # Level 4: 51 ≤ a ≤ 100
    pairs_l4 = [(a, b) for a in range(51, 101) for b in range(5, 51)
                if a - b >= 0]
    random.shuffle(pairs_l4)
    for a, b in pairs_l4[:20]:
        sub_row(a, b, 4)

    return rows


# ─────────────────────────────────────────────────────────
# SK07  Điền số còn thiếu
# ─────────────────────────────────────────────────────────
def gen_sk07():
    rows = []
    idx = 1

    def miss_row(q_vi, q_en, correct, diff, hint):
        nonlocal idx
        pool = list(range(max(0, correct - 5), correct + 7))
        pool = [x for x in pool if x != correct]
        if len(pool) < 3:
            pool += [correct + 10, correct + 15, correct + 20]
        opts, ans = pick4(correct, pool)
        rows.append([f'SK07_{idx:04d}', 'SK07', 'multiple_choice',
                     q_vi, q_en, opts, ans, diff, hint])
        idx += 1

    # Template 1: ___ + b = c  (find a)
    t1 = [(0,1,1), (1,2,3), (2,3,5), (3,4,7), (0,5,5), (4,6,10),
          (3,7,10), (5,5,10), (8,2,10), (7,3,10),
          (10,5,15), (12,8,20), (15,5,20), (20,10,30), (25,5,30),
          (30,20,50), (40,10,50), (45,5,50), (50,30,80), (60,20,80)]
    for a, b, c in t1:
        miss_row(f'___ + {b} = {c}', f'___ + {b} = {c}',
                 a, 2, f'{c} - {b} = {a}')

    # Template 2: a + ___ = c  (find b)
    t2 = [(1,0,1), (2,1,3), (3,2,5), (0,7,7), (5,5,10), (6,4,10),
          (8,12,20), (15,5,20), (10,20,30), (25,25,50),
          (30,20,50), (45,5,50), (50,30,80), (60,40,100)]
    for a, b, c in t2:
        miss_row(f'{a} + ___ = {c}', f'{a} + ___ = {c}',
                 b, 2, f'{c} - {a} = {b}')

    # Template 3: a - ___ = c  (find b = a-c)
    t3 = [(5,2,3), (10,3,7), (8,5,3), (10,10,0), (15,5,10),
          (20,8,12), (30,15,15), (50,20,30), (100,45,55), (80,30,50)]
    for a, b, c in t3:
        miss_row(f'{a} - ___ = {c}', f'{a} - ___ = {c}',
                 b, 3, f'{a} - {c} = {b}')

    # Template 4: ___ - b = c  (find a = b+c)
    t4 = [(3,2,1), (8,6,2), (7,4,3), (15,10,5),
          (20,10,10), (35,20,15), (50,30,20), (75,50,25)]
    for a, c, b in t4:   # stored as (a, c, b) where a-b=c
        miss_row(f'___ - {b} = {c}', f'___ - {b} = {c}',
                 a, 3, f'{b} + {c} = {a}')

    # Template 5: dãy số có chỗ trống
    seqs = [
        # (shown_with_blank, correct, diff)
        ('1, 2, ___, 4, 5',    3,  1),
        ('2, ___, 4, 5, 6',    3,  1),
        ('3, 4, 5, ___, 7',    6,  1),
        ('0, 1, ___, 3',       2,  1),
        ('5, 6, ___, 8',       7,  1),
        ('8, 9, ___, 11',      10, 1),
        ('10, ___, 12, 13',    11, 2),
        ('15, 16, 17, ___, 19', 18, 2),
        ('2, 4, ___, 8, 10',   6,  2),
        ('5, 10, ___, 20, 25', 15, 2),
        ('10, 20, ___, 40, 50', 30, 2),
        ('1, ___, 9, 13, 17',  5,  3),
        ('3, 6, ___, 12, 15',  9,  3),
        ('20, 18, ___, 14, 12', 16, 3),
        ('50, 45, ___, 35, 30', 40, 3),
        ('100, 90, ___, 70, 60', 80, 3),
        ('4, 8, 12, ___, 20',  16, 3),
        ('25, 50, ___, 100',   75, 3),
    ]
    for shown, correct, diff in seqs:
        miss_row(f'Điền số còn thiếu: {shown}',
                 f'Fill in: {shown}',
                 correct, diff, 'Tìm quy luật dãy số')

    return rows


# ─────────────────────────────────────────────────────────
# SK08  Số lớn nhất / bé nhất trong phạm vi 1000
# ─────────────────────────────────────────────────────────
def gen_sk08():
    rows = []
    idx = 1

    def mm_row(numbers, ask_min, diff):
        nonlocal idx
        correct = min(numbers) if ask_min else max(numbers)
        q_vi = 'Chọn số BÉ nhất' if ask_min else 'Chọn số LỚN nhất'
        q_en = 'Choose the smallest number' if ask_min else 'Choose the largest number'
        hint = f'Số {"bé" if ask_min else "lớn"} nhất là {correct}'
        opts_str = ','.join(str(n) for n in numbers)
        rows.append([f'SK08_{idx:04d}', 'SK08', 'min_max',
                     q_vi, q_en, opts_str, str(correct), diff, hint])
        idx += 1

    # Level 1: 4 single-digit numbers
    sets_l1 = [
        [1, 5, 3, 8], [2, 7, 4, 9], [0, 6, 3, 5], [4, 1, 8, 6],
        [3, 7, 1, 9], [5, 2, 8, 4], [0, 9, 3, 6], [7, 2, 5, 1],
        [4, 8, 2, 6], [3, 9, 1, 7], [0, 4, 7, 2], [6, 1, 9, 4],
    ]
    for nums in sets_l1:
        mm_row(nums, True, 1)
        mm_row(nums, False, 1)

    # Level 2: mixed single+double digit
    sets_l2 = [
        [5, 23, 7, 45], [12, 3, 67, 18], [99, 55, 8, 34],
        [72, 8, 45, 91], [50, 5, 77, 33], [64, 7, 28, 9],
        [15, 51, 5, 50], [80, 8, 48, 84],
    ]
    for nums in sets_l2:
        mm_row(nums, True, 2)
        mm_row(nums, False, 2)

    # Level 3: all two-digit
    sets_l3 = [
        [23, 45, 12, 67], [88, 55, 33, 77], [91, 19, 52, 28],
        [44, 14, 84, 74], [36, 63, 17, 71], [82, 28, 55, 46],
        [99, 11, 55, 44], [67, 76, 57, 75], [30, 33, 3, 3],
    ]
    for nums in sets_l3:
        mm_row(nums, True, 2)
        mm_row(nums, False, 2)

    # Level 4: include three-digit 0-999
    sets_l4 = [
        [234, 45, 567, 128], [789, 456, 123, 890], [100, 500, 300, 700],
        [999, 111, 555, 333], [50, 500, 5, 505],
        [123, 321, 213, 231, 312], [200, 220, 202, 222, 20],
    ]
    for nums in sets_l4:
        mm_row(nums, True, 3)
        mm_row(nums, False, 3)

    # Level 5: close three-digit values (tricky)
    sets_l5 = [
        [456, 465, 546, 564, 645],
        [789, 798, 879, 897, 978],
        [123, 132, 213, 231, 312, 321],
        [555, 545, 565, 550, 505],
        [990, 909, 900, 999, 919],
        [100, 110, 101, 111, 10],
    ]
    for nums in sets_l5:
        mm_row(nums, True, 4)
        mm_row(nums, False, 4)

    return rows


# ─────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────
def main():
    print("Generating question CSVs...")

    generators = [
        ('sk01_number_recognition.csv', 'SK01', gen_sk01),
        ('sk02_number_100.csv',         'SK02', gen_sk02),
        ('sk03_counting.csv',           'SK03', gen_sk03),
        ('sk04_comparison.csv',         'SK04', gen_sk04),
        ('sk05_addition.csv',           'SK05', gen_sk05),
        ('sk06_subtraction.csv',        'SK06', gen_sk06),
        ('sk07_missing_number.csv',     'SK07', gen_sk07),
        ('sk08_min_max.csv',            'SK08', gen_sk08),
    ]

    total = 0
    for filename, skill, gen_fn in generators:
        rows = gen_fn()
        filepath = os.path.join(QUESTIONS_DIR, filename)
        write_csv(filepath, rows)
        total += len(rows)

    print(f"\nTotal: {total} questions across all skills")


if __name__ == '__main__':
    main()
