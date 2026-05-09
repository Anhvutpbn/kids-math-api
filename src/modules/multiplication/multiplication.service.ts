import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MultiplicationSession,
  MultiplicationSessionDocument,
} from './schemas/multiplication-session.schema';
import {
  MultiplicationProgress,
  MultiplicationProgressDocument,
} from './schemas/multiplication-progress.schema';
import { SubmitMultiplicationDto } from './dto/submit-multiplication.dto';
import { MULTIPLICATION_LEVEL_CONFIG } from './multiplication.constants';

@Injectable()
export class MultiplicationService {
  constructor(
    @InjectModel(MultiplicationSession.name)
    private sessionModel: Model<MultiplicationSessionDocument>,
    @InjectModel(MultiplicationProgress.name)
    private progressModel: Model<MultiplicationProgressDocument>,
  ) {}

  async getProgress(userId: string): Promise<MultiplicationProgressDocument> {
    const existing = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) return existing;
    return this.progressModel.create({ userId: new Types.ObjectId(userId) });
  }

  async saveSession(userId: string, dto: SubmitMultiplicationDto) {
    const config = MULTIPLICATION_LEVEL_CONFIG[dto.level];
    if (!config) throw new BadRequestException(`Level ${dto.level} không hợp lệ`);

    const score = Math.round((dto.correctCount / dto.totalCount) * 100);

    await this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      level: dto.level,
      correctCount: dto.correctCount,
      totalCount: dto.totalCount,
      heartsLeft: dto.heartsLeft,
      passed: dto.passed,
      durationMs: dto.durationMs,
      score,
    });

    const progress = await this.getProgress(userId);

    // Update session count
    if (dto.level === 'basic') progress.basicSessionCount += 1;
    else if (dto.level === 'medium') progress.mediumSessionCount += 1;
    else if (dto.level === 'hard') progress.hardSessionCount += 1;

    // Update best score
    if (dto.level === 'basic') progress.basicBestScore = Math.max(progress.basicBestScore, score);
    else if (dto.level === 'medium') progress.mediumBestScore = Math.max(progress.mediumBestScore, score);
    else if (dto.level === 'hard') progress.hardBestScore = Math.max(progress.hardBestScore, score);

    // Unlock next level on pass
    if (dto.passed) {
      if (dto.level === 'basic' && !progress.mediumUnlocked) {
        progress.mediumUnlocked = true;
      } else if (dto.level === 'medium' && !progress.hardUnlocked) {
        progress.hardUnlocked = true;
      }
    }

    await progress.save();

    return {
      level: dto.level,
      score,
      passed: dto.passed,
      mediumUnlocked: progress.mediumUnlocked,
      hardUnlocked: progress.hardUnlocked,
      basicBestScore: progress.basicBestScore,
      mediumBestScore: progress.mediumBestScore,
      hardBestScore: progress.hardBestScore,
    };
  }

  async getHistory(userId: string, limit = 20, offset = 0) {
    const sessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return sessions.map((s) => ({
      id: (s as any)._id.toString(),
      level: s.level,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
      heartsLeft: s.heartsLeft,
      passed: s.passed,
      score: s.score,
      durationMs: s.durationMs,
      completedAt: (s as any).createdAt,
    }));
  }
}
