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
import {
  generateSK03, generateSK04, generateSK05,
  generateSK06, generateSK07, generateSK08,
} from './question-generator';

// SK01: 10, SK02: 100 (CSV) + SK03-SK08 generated = 1160 total
const EXPECTED_QUESTION_COUNT = 10 + 100 + 100 + 200 + 150 + 150 + 150 + 300;

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
    const dbCount = await this.questionModel.countDocuments();
    const sk05Sample = await this.questionModel.findOne({ skillId: 'SK05' });
    const alreadyMigrated = sk05Sample?.type === 'vertical_arithmetic';

    if (dbCount === EXPECTED_QUESTION_COUNT && alreadyMigrated) {
      this.logger.log(`Questions already seeded (${dbCount}), skipping`);
      return;
    }

    if (dbCount === EXPECTED_QUESTION_COUNT && !alreadyMigrated) {
      this.logger.log('SK05/SK06 not yet migrated to vertical_arithmetic — reseeding...');
    }

    this.logger.log(`Expected ${EXPECTED_QUESTION_COUNT} questions, DB has ${dbCount} — reseeding...`);
    await this.questionModel.deleteMany({});
    await this.queueModel.deleteMany({});

    // SK01 + SK02 from CSV
    const csvRows = loadAllQuestionCsvs(dataDir);
    const csvDocs = csvRows
      .filter((row) => ['SK01', 'SK02'].includes(row.skill_id))
      .map((row) => ({
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

    // SK03–SK08 generated
    const sk03 = generateSK03(); const sk04 = generateSK04();
    const sk05 = generateSK05(); const sk06 = generateSK06();
    const sk07 = generateSK07(); const sk08 = generateSK08();
    this.logger.log(`Generator counts: SK03=${sk03.length} SK04=${sk04.length} SK05=${sk05.length} SK06=${sk06.length} SK07=${sk07.length} SK08=${sk08.length} total=${sk03.length+sk04.length+sk05.length+sk06.length+sk07.length+sk08.length}`);
    const generated = [
      ...sk03, ...sk04, ...sk05, ...sk06, ...sk07, ...sk08,
    ].map((q) => ({
      id: q.id,
      skillId: q.skillId,
      type: q.type,
      questionVi: q.questionVi,
      questionEn: q.questionEn,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      hintVi: q.hintVi,
      imagePath: null,
    }));

    const allDocs = [...csvDocs, ...generated];
    await this.questionModel.insertMany(allDocs, { ordered: false });
    this.logger.log(`Seeded ${allDocs.length} questions (${csvDocs.length} CSV + ${generated.length} generated)`);
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
