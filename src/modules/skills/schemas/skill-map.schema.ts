import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SkillMapDocument = SkillMap & Document;

export type ErrorType = 'conceptual' | 'careless' | 'slow' | null;

@Schema({ timestamps: true })
export class SkillMap {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  skillId: string;

  @Prop({ default: 0, min: 0, max: 100 })
  masteryScore: number;

  @Prop({ default: false })
  locked: boolean;

  @Prop({ type: String, default: null })
  errorTypeFlag: ErrorType;

  @Prop({ type: Date, default: null })
  lastPracticedAt: Date | null;

  @Prop({ type: Date, default: null })
  nextReviewAt: Date | null;
}

export const SkillMapSchema = SchemaFactory.createForClass(SkillMap);
SkillMapSchema.index({ userId: 1, skillId: 1 }, { unique: true });
