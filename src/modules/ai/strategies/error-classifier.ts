import { Injectable } from '@nestjs/common';
import { QuestionResult } from '../../sessions/schemas/question-result.schema';

export type ErrorType = 'conceptual' | 'careless' | 'slow' | null;

@Injectable()
export class ErrorClassifier {
  /**
   * Classifies the dominant error type per skill based on a list of question results.
   * Rules:
   *   - conceptual : accuracy < 50 %  (more wrong than right — fundamental misunderstanding)
   *   - slow       : accuracy >= 50 % but avgTimeMs > 10 000 ms  (knows it, just too slow)
   *   - careless   : accuracy >= 50 % and avgTimeMs <= 10 000 ms but has any wrong answers
   *   - null       : all correct
   */
  classifyErrors(results: QuestionResult[]): Map<string, ErrorType> {
    const bySkill = new Map<string, QuestionResult[]>();

    for (const r of results) {
      if (!bySkill.has(r.skillId)) bySkill.set(r.skillId, []);
      bySkill.get(r.skillId)!.push(r);
    }

    const output = new Map<string, ErrorType>();

    for (const [skillId, items] of bySkill.entries()) {
      const total = items.length;
      const correct = items.filter((r) => r.isCorrect).length;
      const accuracy = total > 0 ? correct / total : 1;
      const avgTimeMs =
        total > 0 ? items.reduce((s, r) => s + r.timeSpentMs, 0) / total : 0;

      let errorType: ErrorType = null;

      if (accuracy < 0.5) {
        errorType = 'conceptual';
      } else if (avgTimeMs > 10_000) {
        errorType = 'slow';
      } else if (correct < total) {
        errorType = 'careless';
      }

      output.set(skillId, errorType);
    }

    return output;
  }
}
