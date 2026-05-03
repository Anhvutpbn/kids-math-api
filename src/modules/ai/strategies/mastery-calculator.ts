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
    // Base delta: +15 for perfect, −10 for zero accuracy, linear in between
    const baseDelta = (accuracy - 0.5) * 30;

    // Error-type penalty
    let errorPenalty = 0;
    if (errorType === 'conceptual') errorPenalty = -5;
    else if (errorType === 'slow') errorPenalty = -2;
    else if (errorType === 'careless') errorPenalty = -1;

    // Speed bonus: reward fast, accurate answers
    let speedBonus = 0;
    if (accuracy >= 0.8) {
      if (avgTimeMs < 4_000) speedBonus = 3;
      else if (avgTimeMs < 7_000) speedBonus = 1;
    }

    // Diminishing returns near the top: soften gains above mastery 80
    let scalingFactor = 1;
    if (currentMastery >= 80 && baseDelta > 0) {
      scalingFactor = 0.5;
    }

    return (baseDelta * scalingFactor) + errorPenalty + speedBonus;
  }
}
