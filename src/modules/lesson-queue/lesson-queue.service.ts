import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LessonQueue, LessonQueueDocument } from './schemas/lesson-queue.schema';
import { SkillsService } from '../skills/skills.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class LessonQueueService {
  constructor(
    @InjectModel(LessonQueue.name) private queueModel: Model<LessonQueueDocument>,
    private skillsService: SkillsService,
    private questionsService: QuestionsService,
  ) {}

  async getNextQueue(userId: string) {
    const queue = await this.queueModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'pending',
    }).sort({ createdAt: -1 });
    if (!queue) return null;
    return this.populateQueueQuestions(queue);
  }

  async populateQueueQuestions(queue: LessonQueueDocument) {
    const populated = await Promise.all(
      queue.questions.map(async (item) => {
        const q = await this.questionsService.findById(item.questionId);
        if (!q) return null;
        return {
          id: q.id,
          skillId: q.skillId,
          type: q.type,
          questionVi: q.questionVi,
          questionEn: q.questionEn,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          hintVi: q.hintVi,
        };
      }),
    );
    return {
      _id: queue._id,
      userId: queue.userId,
      queueType: queue.queueType,
      status: queue.status,
      createdAt: (queue as any).createdAt,
      updatedAt: (queue as any).updatedAt,
      questions: populated.filter(Boolean),
    };
  }

  async generateDailyQueue(userId: string): Promise<LessonQueueDocument> {
    const skillMap = await this.skillsService.getSkillMap(userId);
    const unlockedSkills = skillMap.filter((s) => !s.locked);

    // Sort by mastery ascending (weakest first)
    const sorted = [...unlockedSkills].sort((a, b) => a.masteryScore - b.masteryScore);

    const weak = sorted.filter((s) => s.masteryScore < 60).slice(0, 3);
    const medium = sorted.filter((s) => s.masteryScore >= 60 && s.masteryScore < 80);
    const review = unlockedSkills.filter((s) => s.nextReviewAt && s.nextReviewAt <= new Date());

    const TARGET = 15;
    const weakCount = Math.round(TARGET * 0.5);
    const mediumCount = Math.round(TARGET * 0.3);
    const reviewCount = TARGET - weakCount - mediumCount;

    const questions: { questionId: string; skillId: string; difficulty: number }[] = [];

    await this.addQuestions(questions, weak, weakCount, [1, 2]);
    await this.addQuestions(questions, medium, mediumCount, [2, 3]);
    await this.addQuestions(questions, review, reviewCount, [2]);

    // Fallback: all skills mastered with no reviews due → maintenance session from all unlocked skills
    if (questions.length === 0 && unlockedSkills.length > 0) {
      await this.addQuestions(questions, unlockedSkills, TARGET, [1, 2, 3]);
    }

    // Deduplicate before shuffling
    const unique = questions.filter(
      (q, i, arr) => arr.findIndex((x) => x.questionId === q.questionId) === i,
    );

    // Shuffle: no 2 same skill in a row
    const shuffled = this.shuffleNoAdjacentSkill(unique);

    return this.queueModel.create({
      userId: new Types.ObjectId(userId),
      questions: shuffled,
      queueType: 'daily',
      status: 'pending',
    });
  }

  async generateWeeklyQueue(userId: string): Promise<LessonQueueDocument> {
    const skillMap = await this.skillsService.getSkillMap(userId);
    const unlockedSkills = skillMap.filter((s) => !s.locked);

    const TARGET = 20;
    const questions: { questionId: string; skillId: string; difficulty: number }[] = [];

    // Weekly covers all unlocked skills across all difficulties
    await this.addQuestions(questions, unlockedSkills, TARGET, [1, 2, 3]);

    const shuffled = this.shuffleNoAdjacentSkill(questions);

    return this.queueModel.create({
      userId: new Types.ObjectId(userId),
      questions: shuffled,
      queueType: 'weekly_review',
      status: 'pending',
    });
  }

  async markInProgress(queueId: string) {
    await this.queueModel.findByIdAndUpdate(queueId, { status: 'in_progress' });
  }

  async markDone(queueId: string) {
    await this.queueModel.findByIdAndUpdate(queueId, { status: 'done' });
  }

  async generateSkillFocusQueue(
    userId: string,
    skillId: string,
    difficulty: number,
    count = 12,
  ): Promise<LessonQueueDocument> {
    const pool = await this.questionsService.findBySkill(skillId, difficulty);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    return this.queueModel.create({
      userId: new Types.ObjectId(userId),
      questions: shuffled.map((q) => ({ questionId: q.id, skillId: q.skillId, difficulty: q.difficulty })),
      queueType: 'skill_focus',
      status: 'pending',
    });
  }

  async markCurrentQueueDone(userId: string) {
    await this.queueModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), status: { $in: ['pending', 'in_progress'] } },
      { status: 'done' },
      { sort: { createdAt: -1 } },
    );
  }

  private async addQuestions(
    target: { questionId: string; skillId: string; difficulty: number }[],
    skills: any[],
    count: number,
    difficulties: number[],
  ) {
    if (!skills.length || count <= 0) return;
    const skillIds = skills.map((s) => s.skillId);
    const pool = await this.questionsService.findBySkills(skillIds);
    const filtered = pool.filter((q) => difficulties.includes(q.difficulty));
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, count);
    shuffled.forEach((q) => target.push({ questionId: q.id, skillId: q.skillId, difficulty: q.difficulty }));
  }

  private shuffleNoAdjacentSkill(
    items: { questionId: string; skillId: string; difficulty: number }[],
  ) {
    const result: typeof items = [];
    const remaining = [...items];
    while (remaining.length) {
      const lastSkill = result.at(-1)?.skillId;
      const idx = remaining.findIndex((q) => q.skillId !== lastSkill);
      if (idx === -1) {
        result.push(...remaining.splice(0));
      } else {
        result.push(...remaining.splice(idx, 1));
      }
    }
    return result;
  }
}
