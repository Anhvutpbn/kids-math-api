import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningSession, SessionDocument } from './schemas/session.schema';
import { QuestionResult, QuestionResultDocument } from './schemas/question-result.schema';
import { LessonQueueService } from '../lesson-queue/lesson-queue.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(LearningSession.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(QuestionResult.name) private resultModel: Model<QuestionResultDocument>,
    private lessonQueueService: LessonQueueService,
    private questionsService: QuestionsService,
  ) {}

  async startSession(userId: string) {
    return this.sessionModel.create({ userId: new Types.ObjectId(userId) });
  }

  async submitQuestion(dto: {
    sessionId: string;
    userId: string;
    skillId: string;
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpentMs: number;
    attemptNumber: number;
    consecutiveErrors?: boolean;
  }) {
    await this.resultModel.create({
      sessionId: new Types.ObjectId(dto.sessionId),
      userId: new Types.ObjectId(dto.userId),
      skillId: dto.skillId,
      questionId: dto.questionId,
      userAnswer: dto.userAnswer,
      isCorrect: dto.isCorrect,
      timeSpentMs: dto.timeSpentMs,
      attemptNumber: dto.attemptNumber,
    });

    // Check if tutorial should be injected
    if (dto.consecutiveErrors) {
      const recentErrors = await this.resultModel
        .find({ sessionId: new Types.ObjectId(dto.sessionId), skillId: dto.skillId, isCorrect: false })
        .sort({ createdAt: -1 })
        .limit(3);
      if (recentErrors.length >= 3) {
        return { accepted: true, inject_tutorial: true, tutorial_skill_id: dto.skillId };
      }
    }
    return { accepted: true, inject_tutorial: false };
  }

  async endSession(sessionId: string, totalDurationMs: number, userId?: string) {
    const results = await this.resultModel.find({ sessionId: new Types.ObjectId(sessionId) });
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalQuestions = results.length;
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    const avgTimeMs = totalQuestions > 0
      ? results.reduce((s, r) => s + r.timeSpentMs, 0) / totalQuestions
      : 0;

    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;
    const baseXp = correctCount * 10;
    const multiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : stars === 1 ? 1.0 : 0.5;
    const speedBonus = avgTimeMs < 5000 ? 0.2 : avgTimeMs < 8000 ? 0.1 : 0;
    const xpEarned = Math.max(5, Math.ceil((baseXp * multiplier * (1 + speedBonus)) / 5) * 5);

    const session = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { endedAt: new Date(), totalQuestions, correctCount, xpEarned, stars, totalDurationMs },
      { new: true },
    );
    if (userId) {
      await this.lessonQueueService.markCurrentQueueDone(userId);
    }
    return { session, accuracy, avgTimeMs, xpEarned, stars, correctCount, totalQuestions };
  }

  async getSessionById(sessionId: string) {
    return this.sessionModel.findById(sessionId);
  }

  async getSessionResults(sessionId: string) {
    const results = await this.resultModel.find({ sessionId: new Types.ObjectId(sessionId) });
    const questionIds = [...new Set(results.map((r) => r.questionId))];
    const questions = await this.questionsService.findMany(questionIds);
    const qMap = new Map(questions.map((q) => [q.id, q]));

    return results.map((r) => {
      const q = qMap.get(r.questionId);
      return {
        questionId: r.questionId,
        skillId: r.skillId,
        questionVi: q?.questionVi ?? r.questionId,
        correctAnswer: q?.correctAnswer ?? '',
        submittedAnswer: r.userAnswer,
        isCorrect: r.isCorrect,
        timeSpentMs: r.timeSpentMs,
        attemptNumber: r.attemptNumber,
      };
    });
  }

  async getUserSessions(userId: string, limitDays = 7) {
    const since = new Date();
    since.setDate(since.getDate() - limitDays);
    return this.sessionModel
      .find({ userId: new Types.ObjectId(userId), endedAt: { $gte: since } })
      .sort({ createdAt: -1 });
  }
}
