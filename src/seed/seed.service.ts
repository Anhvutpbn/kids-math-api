import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Skill, SkillDocument } from '../modules/skills/schemas/skill.schema';
import { Question, QuestionDocument } from '../modules/questions/schemas/question.schema';
import { Badge, BadgeDocument } from '../modules/badges/schemas/badge.schema';
import { LessonQueue, LessonQueueDocument } from '../modules/lesson-queue/schemas/lesson-queue.schema';
import { loadCsv, loadAllQuestionCsvs } from './csv-loader';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    @InjectModel(LessonQueue.name) private queueModel: Model<LessonQueueDocument>,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const dataDir = this.config.get<string>('dataDir') ?? './data';
    await this.migrateMinMaxToSk08();
    await this.seedSkills(dataDir);
    await this.seedQuestions(dataDir);
    await this.seedBadges(dataDir);
  }

  // One-time migration: remove old min_max questions that were under SK04
  private async migrateMinMaxToSk08() {
    const result = await this.questionModel.deleteMany({ type: 'min_max', skillId: 'SK04' });
    if (result.deletedCount > 0) {
      this.logger.log(`Migration: removed ${result.deletedCount} old SK04 min_max questions`);
    }
  }

  private async seedSkills(dataDir: string) {
    const rows = loadCsv<any>(path.join(dataDir, 'skills.csv'));
    const existing = await this.skillModel.countDocuments();
    if (existing >= rows.length) {
      this.logger.log(`Skills already seeded (${existing}), skipping`);
      return;
    }
    const docs = rows.map((row) => ({
      id: row.id,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      descriptionVi: row.description_vi,
      dependsOn: row.depends_on ? row.depends_on.split(' ').filter(Boolean) : [],
      order: parseInt(row.order, 10),
    }));
    await this.skillModel.insertMany(docs, { ordered: false });
    this.logger.log(`Seeded ${docs.length} skills`);
  }

  private async seedQuestions(dataDir: string) {
    const rows = loadAllQuestionCsvs(dataDir);
    const docs = rows.map((row) => ({
      id: row.id,
      skillId: row.skill_id,
      type: row.type,
      questionVi: row.question_vi,
      questionEn: row.question_en,
      options: row.options ? row.options.split(',').map((s: string) => s.trim()) : [],
      correctAnswer: row.correct_answer,
      difficulty: parseInt(row.difficulty, 10) || 1,
      hintVi: row.hint_vi,
      imagePath: row.image_path || null,
    }));

    // Upsert: insert new questions, skip existing ones
    const result = await this.questionModel.bulkWrite(
      docs.map((doc) => ({
        updateOne: {
          filter: { id: doc.id },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    const inserted = result.upsertedCount ?? 0;
    this.logger.log(`Questions: ${docs.length} in CSV, ${inserted} newly inserted`);

    // New questions added → clear all pending queues so next session
    // generates a fresh queue that includes the new question types
    if (inserted > 0) {
      const cleared = await this.queueModel.deleteMany({ status: 'pending' });
      this.logger.log(`Cleared ${cleared.deletedCount} stale pending queues`);
    }
  }

  private async seedBadges(dataDir: string) {
    const rows = loadCsv<any>(path.join(dataDir, 'badges.csv'));
    const existing = await this.badgeModel.countDocuments();
    if (existing >= rows.length) {
      this.logger.log(`Badges already seeded (${existing}), skipping`);
      return;
    }
    const docs = rows.map((row) => ({
      id: row.id,
      code: row.code,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      conditionType: row.condition_type,
      conditionValue: row.condition_value,
      descriptionVi: row.description_vi,
    }));
    await this.badgeModel.insertMany(docs, { ordered: false });
    this.logger.log(`Seeded ${docs.length} badges`);
  }
}
