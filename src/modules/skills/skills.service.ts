import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { SkillMap, SkillMapDocument } from './schemas/skill-map.schema';

const SKILL_ORDER = ['SK01','SK02','SK03','SK04','SK05','SK06','SK07','SK08'];
const UNLOCK_THRESHOLD = 30;

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
    @InjectModel(SkillMap.name) private skillMapModel: Model<SkillMapDocument>,
  ) {}

  findAll() {
    return this.skillModel.find().sort({ order: 1 });
  }

  findOne(id: string) {
    return this.skillModel.findOne({ id });
  }

  async getSkillMap(userId: string) {
    const uid = new Types.ObjectId(userId);
    const entries = await this.skillMapModel.find({ userId: uid }).sort({ skillId: 1 });
    const allSkills = await this.skillModel.find();
    const skillDefs = new Map(allSkills.map((s) => [s.id, s]));

    // Lazily create entries for any skills added after initial init (e.g. SK08)
    const existingIds = new Set(entries.map((e) => e.skillId));
    const missing = SKILL_ORDER.filter((id) => !existingIds.has(id));
    for (const skillId of missing) {
      await this.skillMapModel.create({ userId: uid, skillId, masteryScore: 0, locked: skillId !== 'SK01' });
    }

    // Re-fetch after any inserts
    const allEntries = missing.length > 0
      ? await this.skillMapModel.find({ userId: uid }).sort({ skillId: 1 })
      : entries;
    const masteryMap = new Map(allEntries.map((e) => [e.skillId, e.masteryScore]));

    // Re-evaluate lock status for every locked skill — catches stale locks and new additions
    for (const entry of allEntries) {
      if (!entry.locked) continue;
      const def = skillDefs.get(entry.skillId);
      if (!def?.dependsOn?.length) continue;
      const allPrereqsMet = def.dependsOn.every((dep) => (masteryMap.get(dep) ?? 0) >= UNLOCK_THRESHOLD);
      if (allPrereqsMet) {
        await this.skillMapModel.findOneAndUpdate({ userId: uid, skillId: entry.skillId }, { locked: false });
        masteryMap.set(entry.skillId, entry.masteryScore); // keep map consistent for downstream skills
      }
    }

    return this.skillMapModel.find({ userId: uid }).sort({ skillId: 1 });
  }

  async getSkillEntry(userId: string, skillId: string) {
    return this.skillMapModel.findOne({ userId: new Types.ObjectId(userId), skillId });
  }

  async initSkillMap(userId: string, initialScores: Record<string, number> = {}) {
    const uid = new Types.ObjectId(userId);
    for (const skillId of SKILL_ORDER) {
      const exists = await this.skillMapModel.findOne({ userId: uid, skillId });
      if (!exists) {
        const skill = await this.skillModel.findOne({ id: skillId });
        const locked = skill?.dependsOn?.length
          ? skill.dependsOn.some(
              async (dep) => (await initialScores[dep] ?? 0) < UNLOCK_THRESHOLD
            )
          : false;
        await this.skillMapModel.create({
          userId: uid,
          skillId,
          masteryScore: initialScores[skillId] ?? 0,
          locked: skillId !== 'SK01' && !initialScores[skillId],
        });
      }
    }
    return this.getSkillMap(userId);
  }

  async updateMastery(userId: string, skillId: string, newMastery: number, errorType: string | null) {
    const uid = new Types.ObjectId(userId);
    const clamped = Math.min(100, Math.max(0, newMastery));
    const setFields: any = {
      masteryScore: clamped,
      errorTypeFlag: errorType,
      lastPracticedAt: new Date(),
    };
    if (clamped >= 80) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setFields.nextReviewAt = d;
    }
    await this.skillMapModel.findOneAndUpdate(
      { userId: uid, skillId },
      { $set: setFields, $inc: { sessionCount: 1 } },
    );
    await this.checkAndUnlockDependents(userId, skillId, clamped);
  }

  private async checkAndUnlockDependents(userId: string, unlockedSkillId: string, mastery: number) {
    if (mastery < UNLOCK_THRESHOLD) return;
    const uid = new Types.ObjectId(userId);
    const allSkills = await this.skillModel.find();
    for (const skill of allSkills) {
      if (!skill.dependsOn.includes(unlockedSkillId)) continue;
      const allPrereqsMet = await Promise.all(
        skill.dependsOn.map(async (dep) => {
          const entry = await this.skillMapModel.findOne({ userId: uid, skillId: dep });
          return (entry?.masteryScore ?? 0) >= UNLOCK_THRESHOLD;
        }),
      );
      if (allPrereqsMet.every(Boolean)) {
        await this.skillMapModel.findOneAndUpdate(
          { userId: uid, skillId: skill.id },
          { locked: false },
        );
      }
    }
  }
}
