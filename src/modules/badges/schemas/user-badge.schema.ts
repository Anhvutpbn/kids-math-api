import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserBadgeDocument = UserBadge & Document;

@Schema({ timestamps: true })
export class UserBadge {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  badgeId: string;

  @Prop({ default: () => new Date() })
  earnedAt: Date;
}

export const UserBadgeSchema = SchemaFactory.createForClass(UserBadge);
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
