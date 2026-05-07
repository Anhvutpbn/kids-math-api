import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Badge, BadgeDocument } from './schemas/badge.schema';
import { UserBadge, UserBadgeDocument } from './schemas/user-badge.schema';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    @InjectModel(UserBadge.name) private userBadgeModel: Model<UserBadgeDocument>,
  ) {}

  getAllBadges(): Promise<BadgeDocument[]> {
    return this.badgeModel.find().exec();
  }

  getUserBadges(userId: string): Promise<UserBadgeDocument[]> {
    return this.userBadgeModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadgeDocument | null> {
    const existing = await this.userBadgeModel.findOne({
      userId: new Types.ObjectId(userId),
      badgeId,
    });
    if (existing) return null;
    return this.userBadgeModel.create({
      userId: new Types.ObjectId(userId),
      badgeId,
      earnedAt: new Date(),
    });
  }

  async checkAndAwardBadges(
    userId: string,
    event: string,
    value: any,
  ): Promise<UserBadgeDocument[]> {
    const allBadges = await this.getAllBadges();
    const awarded: UserBadgeDocument[] = [];

    for (const badge of allBadges) {
      let qualifies = false;

      if (badge.conditionType === 'streak' && event === 'streak') {
        qualifies = Number(value) >= Number(badge.conditionValue);
      } else if (badge.conditionType === 'skill_mastered' && event === 'skill_mastered') {
        // value: { skillId, masteryScore } — conditionValue is the skill ID (e.g. SK01)
        qualifies = value?.skillId === badge.conditionValue && value?.masteryScore >= 80;
      } else if (badge.conditionType === 'sessions_count' && event === 'sessions_count') {
        qualifies = Number(value) >= Number(badge.conditionValue);
      } else if (badge.conditionType === 'xp_total' && event === 'xp_total') {
        qualifies = Number(value) >= Number(badge.conditionValue);
      } else if (badge.conditionType === 'skill_mastery_40' && event === 'skill_mastery_40') {
        qualifies = value?.skillId === badge.conditionValue;
      } else if (badge.conditionType === 'skill_mastery_60' && event === 'skill_mastery_60') {
        qualifies = value?.skillId === badge.conditionValue;
      } else if (badge.conditionType === 'skill_mastery_100' && event === 'skill_mastery_100') {
        qualifies = value?.skillId === badge.conditionValue;
      } else if (badge.conditionType === 'memory_tier' && event === 'memory_tier') {
        qualifies = Number(value) >= Number(badge.conditionValue);
      } else if (badge.conditionType === event) {
        qualifies = Number(value) >= Number(badge.conditionValue);
      }

      if (qualifies) {
        const result = await this.awardBadge(userId, badge.id);
        if (result) awarded.push(result);
      }
    }

    return awarded;
  }
}
