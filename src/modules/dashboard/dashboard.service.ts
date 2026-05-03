import { Injectable } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { SkillsService } from '../skills/skills.service';
import { BadgesService } from '../badges/badges.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class DashboardService {
  constructor(
    private sessionsService: SessionsService,
    private skillsService: SkillsService,
    private badgesService: BadgesService,
    private aiService: AiService,
  ) {}

  async getSummary(userId: string) {
    const [sessions, skillMap, userBadges] = await Promise.all([
      this.sessionsService.getUserSessions(userId, 7),
      this.skillsService.getSkillMap(userId),
      this.badgesService.getUserBadges(userId),
    ]);

    const totalXp = sessions.reduce((sum, s) => sum + (s.xpEarned ?? 0), 0);
    const sessionsThisWeek = sessions.length;

    // Calculate streak from session dates
    const streak = this.calculateStreak(sessions);

    // Skill map preview: top 5 unlocked skills sorted by mastery desc
    const skillMapPreview = skillMap
      .filter((s) => !s.locked)
      .sort((a, b) => b.masteryScore - a.masteryScore)
      .slice(0, 5)
      .map((s) => ({
        skillId: s.skillId,
        masteryScore: s.masteryScore,
        locked: s.locked,
        nextReviewAt: s.nextReviewAt,
      }));

    return {
      streak,
      totalXp,
      sessionsThisWeek,
      badgeCount: userBadges.length,
      skillMapPreview,
    };
  }

  async getSessionHistory(userId: string, limitDays = 7) {
    return this.sessionsService.getUserSessions(userId, limitDays);
  }

  async getSkillOverview(userId: string) {
    const [allSkills, skillMap] = await Promise.all([
      this.skillsService.findAll(),
      this.skillsService.getSkillMap(userId),
    ]);
    const mapById = new Map(skillMap.map((e) => [e.skillId, e]));
    return allSkills.map((skill) => {
      const entry = mapById.get((skill as any).id);
      return {
        skillId: (skill as any).id,
        nameVi: (skill as any).nameVi,
        masteryScore: entry?.masteryScore ?? 0,
        locked: entry?.locked ?? true,
        errorTypeFlag: entry?.errorTypeFlag ?? null,
        nextReviewAt: entry?.nextReviewAt ?? null,
      };
    });
  }

  async getAiInsight(userId: string) {
    return this.aiService.getInsight(userId);
  }

  private calculateStreak(sessions: any[]): number {
    if (!sessions.length) return 0;

    const uniqueDays = new Set(
      sessions
        .filter((s) => s.endedAt)
        .map((s) => new Date(s.endedAt).toISOString().slice(0, 10)),
    );

    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (uniqueDays.has(key)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
