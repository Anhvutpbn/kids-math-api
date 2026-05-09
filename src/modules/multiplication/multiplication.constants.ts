export const MULTIPLICATION_LEVEL_CONFIG = {
  basic: {
    questionCount: 10,
    maxHearts: 3,
    tableMin: 1,
    tableMax: 5,
    label: 'Cơ Bản',
  },
  medium: {
    questionCount: 15,
    maxHearts: 3,
    tableMin: 6,
    tableMax: 10,
    label: 'Trung Bình',
  },
  hard: {
    questionCount: 20,
    maxHearts: 3,
    tableMin: 1,
    tableMax: 9,
    label: 'Khó',
  },
} as const;
