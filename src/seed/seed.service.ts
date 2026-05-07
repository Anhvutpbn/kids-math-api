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
    await this.seedSkills(dataDir);
    await this.seedQuestions(dataDir);
    await this.seedBadges(dataDir);
  }

  private async seedSkills(dataDir: string) {
    const rows = loadCsv<any>(path.join(dataDir, 'skills.csv'));
    const csvCount = rows.length;
    const dbCount = await this.skillModel.countDocuments();

    if (dbCount === csvCount) {
      this.logger.log(`Skills already seeded (${dbCount}), skipping`);
      return;
    }

    // Count mismatch → wipe and reload from CSV
    await this.skillModel.deleteMany({});
    const docs = rows.map((row) => ({
      id: row.id,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      descriptionVi: row.description_vi,
      dependsOn: row.depends_on ? row.depends_on.split(' ').filter(Boolean) : [],
      order: parseInt(row.order, 10),
    }));
    await this.skillModel.insertMany(docs, { ordered: false });
    this.logger.log(`Seeded ${docs.length} skills (replaced ${dbCount} old)`);
  }

  private async seedQuestions(dataDir: string) {
    const rows = loadAllQuestionCsvs(dataDir);
    const csvCount = rows.length;
    const dbCount = await this.questionModel.countDocuments();

    if (dbCount === csvCount) {
      this.logger.log(`Questions already seeded (${dbCount}), skipping`);
      return;
    }

    // Count mismatch → wipe questions + queues, then insert fresh from CSV
    this.logger.log(`CSV has ${csvCount} questions, DB has ${dbCount} — reseeding...`);
    await this.questionModel.deleteMany({});
    await this.queueModel.deleteMany({});

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

    await this.questionModel.insertMany(docs, { ordered: false });
    this.logger.log(`Seeded ${docs.length} questions`);
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
