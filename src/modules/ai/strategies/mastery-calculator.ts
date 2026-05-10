import { Injectable } from '@nestjs/common';
import { ErrorType } from './error-classifier';

@Injectable()
export class MasteryCalculator {
  /**
   * Calculates the new mastery delta to apply after a practice session for a single skill.
   *
   * @param currentMastery  Current mastery score (0–100)
   * @param accuracy        Ratio of correct answers (0–1)
   * @param errorType       Dominant error type from ErrorClassifier
   * @param avgTimeMs       Average time per question in milliseconds
   * @returns               Delta value (can be negative); caller clamps to [0, 100]
   */
  calculateDelta(
    currentMastery: number,
    accuracy: number,
    errorType: ErrorType,
    avgTimeMs: number,
  ): number {
    // Base delta — tiered so it takes many sessions to progress
    let baseDelta: number;
    if (accuracy >= 0.9)      baseDelta = 8;
    else if (accuracy >= 0.7) baseDelta = 5;
    else if (accuracy >= 0.5) baseDelta = 2;
    else                      baseDelta = (accuracy - 0.5) * 20; // negative for poor performance

    // Error-type penalty
    let errorPenalty = 0;
    if (errorType === 'conceptual') errorPenalty = -5;
    else if (errorType === 'slow')  errorPenalty = -2;
    else if (errorType === 'careless') errorPenalty = -1;

    // Speed bonus: capped at +2 (was +3)
    let speedBonus = 0;
    if (accuracy >= 0.8) {
      if (avgTimeMs < 4_000)      speedBonus = 2;
      else if (avgTimeMs < 7_000) speedBonus = 1;
    }

    // Diminishing returns near the top: harder to gain once close to mastery
    let scalingFactor = 1;
    if (currentMastery >= 80 && baseDelta > 0) {
      scalingFactor = 0.3;
    }

    return (baseDelta * scalingFactor) + errorPenalty + speedBonus;
  }
}
