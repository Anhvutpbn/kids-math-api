import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

export function loadCsv<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}

export function loadAllQuestionCsvs(dataDir: string): any[] {
  const questionsDir = path.join(dataDir, 'questions');
  if (!fs.existsSync(questionsDir)) return [];
  return fs
    .readdirSync(questionsDir)
    .filter((f) => f.endsWith('.csv'))
    .flatMap((f) => loadCsv(path.join(questionsDir, f)));
}
