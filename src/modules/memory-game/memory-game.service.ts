import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MemoryGameResult, MemoryGameResultDocument } from './schemas/memory-game-result.schema';
import { MemoryGameProgress, MemoryGameProgressDocument } from './schemas/memory-game-progress.schema';
import { SubmitMemoryGameDto } from './dto/submit-memory-game.dto';
import { BadgesService } from '../badges/badges.service';
import { MEMORY_GAME_LEVELS, MAX_MEMORY_LEVEL, TIER_FIRST_LEVEL } from './memory-game.constants';

@Injectable()
export class MemoryGameService {
  constructor(
    @InjectModel(MemoryGameResult.name)
    private resultModel: Model<MemoryGameResultDocument>,
    @InjectModel(MemoryGameProgress.name)
    private progressModel: Model<MemoryGameProgressDocument>,
    private badgesService: BadgesService,
  ) {}

  getLevels() {
    return MEMORY_GAME_LEVELS;
  }

  async getProgress(userId: string): Promise<MemoryGameProgressDocument> {
    const existing = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) return existing;
    return this.progressModel.create({ userId: new Types.ObjectId(userId) });
  }

  async submit(userId: string, dto: SubmitMemoryGameDto) {
    const config = MEMORY_GAME_LEVELS.find((l) => l.level === dto.level);
    if (!config) throw new BadRequestException(`Level ${dto.level} không tồn tại`);

    await this.resultModel.create({
      userId: new Types.ObjectId(userId),
      level: dto.level,
      tier: config.tier,
      numBoxes: config.numBoxes,
      mistakesAllowed: config.mistakesAllowed,
      mistakesMade: dto.mistakesMade,
      passed: dto.passed,
      durationMs: dto.durationMs,
    });

    const progress = await this.getProgress(userId);
    const newBadges: any[] = [];

    if (dto.passed) {
      // Unlock next level
      const nextLevel = dto.level + 1;
      if (nextLevel <= MAX_MEMORY_LEVEL && progress.maxLevelUnlocked < nextLevel) {
        progress.maxLevelUnlocked = nextLevel;
      }

      // Award tier badge if this is the first level of the tier and tier not yet completed
      const isFirstLevelOfTier = TIER_FIRST_LEVEL[config.tier] === dto.level;
      if (isFirstLevelOfTier && !progress.tiersCompleted.includes(config.tier)) {
        progress.tiersCompleted = [...progress.tiersCompleted, config.tier];
        const tierBadges = await this.badgesService.checkAndAwardBadges(
          userId,
          'memory_tier',
          config.tier,
        );
        newBadges.push(...tierBadges);
      }

      await progress.save();
    }

    return {
      passed: dto.passed,
      level: dto.level,
      tier: config.tier,
      maxLevelUnlocked: progress.maxLevelUnlocked,
      tiersCompleted: progress.tiersCompleted,
      newBadges,
    };
  }

  async getStats(userId: string) {
    const [progress, results] = await Promise.all([
      this.getProgress(userId),
      this.resultModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    const totalAttempts = results.length;
    const totalPassed = results.filter((r) => r.passed).length;

    return {
      maxLevelUnlocked: progress.maxLevelUnlocked,
      tiersCompleted: progress.tiersCompleted,
      totalAttempts,
      totalPassed,
      recentResults: results.slice(0, 10).map((r) => ({
        level: r.level,
        tier: r.tier,
        numBoxes: r.numBoxes,
        mistakesMade: r.mistakesMade,
        passed: r.passed,
        durationMs: r.durationMs,
        createdAt: (r as any).createdAt,
      })),
    };
  }
}
