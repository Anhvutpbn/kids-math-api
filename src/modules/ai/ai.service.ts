import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { LessonQueueService } from '../lesson-queue/lesson-queue.service';
import { ErrorClassifier } from './strategies/error-classifier';
import { MasteryCalculator } from './strategies/mastery-calculator';

export interface AIInsight {
  weakestSkills: { skillId: string; masteryScore: number; errorType: string | null }[];
  strongestSkills: { skillId: string; masteryScore: number }[];
  recommendedFocus: string[];
  overallAccuracy: number;
  avgTimeMs: number;
}

export interface AnalyzeResult {
  insight: AIInsight;
  xpEarned: number;
  streak: { streakCurrent: number; streakLongest: number };
  newBadges: any[];
  nextQueueId: string | null;
}

@Injectable()
export class AiService {
  constructor(
    private sessionsService: SessionsService,
    private skillsService: SkillsService,
    private usersService: UsersService,
    private badgesService: BadgesService,
    private lessonQueueService: LessonQueueService,
    private errorClassifier: ErrorClassifier,
    private masteryCalculator: MasteryCalculator,
  ) {}

  async analyzeSession(sessionId: string, userId: string): Promise<AnalyzeResult> {
    const results = await this.sessionsService.getSessionResults(sessionId);

    if (!results.length) {
      throw new NotFoundException('No results found for this session');
    }

    const errorMap = this.errorClassifier.classifyErrors(results as any);

    const skillStats = new Map<string, { correct: number; total: number; totalTime: number }>();

    for (const r of results) {
      if (!skillStats.has(r.skillId)) {
        skillStats.set(r.skillId, { correct: 0, total: 0, totalTime: 0 });
      }
      const s = skillStats.get(r.skillId)!;
      s.total++;
      if (r.isCorrect) s.correct++;
      s.totalTime += r.timeSpentMs;
    }

    // Update mastery scores and collect mastery events for badge checking
    const masteryEvents: { skillId: string; masteryScore: number }[] = [];

    for (const [skillId, stats] of skillStats.entries()) {
      const accuracy = stats.correct / stats.total;
      const avgTimeMs = stats.totalTime / stats.total;
      const errorType = errorMap.get(skillId) ?? null;

      const currentEntry = await this.skillsService.getSkillEntry(userId, skillId);
      const currentMastery = currentEntry?.masteryScore ?? 0;

      const delta = this.masteryCalculator.calculateDelta(currentMastery, accuracy, errorType, avgTimeMs);
      const newMastery = Math.min(100, Math.max(0, currentMastery + delta));

      await this.skillsService.updateMastery(userId, skillId, newMastery, errorType);
      masteryEvents.push({ skillId, masteryScore: newMastery });
    }

    // Get session for XP info
    const session = await this.sessionsService.getSessionById(sessionId);
    const xpEarned = session?.xpEarned ?? 0;

    // Update user XP and streak
    const [streak] = await Promise.all([
      this.usersService.updateStreak(userId),
      this.usersService.addXp(userId, xpEarned),
    ]);

    // Check badges
    const newBadges: any[] = [];

    for (const { skillId, masteryScore } of masteryEvents) {
      const awarded = await this.badgesService.checkAndAwardBadges(
        userId, 'skill_mastery', { skillId, masteryScore },
      );
      newBadges.push(...awarded);
    }

    // Streak badge check
    const streakBadges = await this.badgesService.checkAndAwardBadges(
      userId, 'streak', streak.streakCurrent,
    );
    newBadges.push(...streakBadges);

    // Session count badge check
    const userSessions = await this.sessionsService.getUserSessions(userId, 365);
    const sessionCountBadges = await this.badgesService.checkAndAwardBadges(
      userId, 'sessions_count', userSessions.length,
    );
    newBadges.push(...sessionCountBadges);

    // Generate next lesson queue
    let nextQueueId: string | null = null;
    try {
      const queue = await this.lessonQueueService.generateDailyQueue(userId);
      nextQueueId = (queue as any)._id.toString();
    } catch {
      // Queue generation failure should not block the response
    }

    const insight = await this.buildInsight(userId, results as any, errorMap);

    return { insight, xpEarned, streak, newBadges, nextQueueId };
  }

  async getWeakAreas(userId: string) {
    const skillMap = await this.skillsService.getSkillMap(userId);
    return skillMap
      .filter((s) => !s.locked)
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 3)
      .map((s) => ({
        skillId: s.skillId,
        masteryScore: s.masteryScore,
        errorTypeFlag: s.errorTypeFlag,
        lastPracticedAt: s.lastPracticedAt,
      }));
  }

  async getInsight(userId: string): Promise<AIInsight> {
    const sessions = await this.sessionsService.getUserSessions(userId, 7);
    const allResults: any[] = [];

    for (const session of sessions) {
      const results = await this.sessionsService.getSessionResults(
        (session as any)._id.toString(),
      );
      allResults.push(...results);
    }

    const errorMap = this.errorClassifier.classifyErrors(allResults);
    return this.buildInsight(userId, allResults, errorMap);
  }

  private async buildInsight(
    userId: string,
    results: any[],
    errorMap: Map<string, any>,
  ): Promise<AIInsight> {
    const skillMap = await this.skillsService.getSkillMap(userId);

    const sorted = [...skillMap]
      .filter((s) => !s.locked)
      .sort((a, b) => a.masteryScore - b.masteryScore);

    const weakestSkills = sorted.slice(0, 3).map((s) => ({
      skillId: s.skillId,
      masteryScore: s.masteryScore,
      errorType: errorMap.get(s.skillId) ?? null,
    }));

    const strongestSkills = [...sorted]
      .reverse()
      .slice(0, 3)
      .map((s) => ({ skillId: s.skillId, masteryScore: s.masteryScore }));

    const recommendedFocus = weakestSkills
      .filter((s) => s.masteryScore < 60)
      .map((s) => s.skillId);

    const totalResults = results.length;
    const overallAccuracy =
      totalResults > 0 ? results.filter((r) => r.isCorrect).length / totalResults : 0;
    const avgTimeMs =
      totalResults > 0 ? results.reduce((s, r) => s + r.timeSpentMs, 0) / totalResults : 0;

    return { weakestSkills, strongestSkills, recommendedFocus, overallAccuracy, avgTimeMs };
  }
}
