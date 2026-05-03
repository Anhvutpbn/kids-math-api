import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = LearningSession & Document;

@Schema({ timestamps: true })
export class LearningSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  endedAt: Date | null;

  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  xpEarned: number;

  @Prop({ default: 0, min: 0, max: 3 })
  stars: number;

  @Prop({ default: 0 })
  totalDurationMs: number;
}

export const SessionSchema = SchemaFactory.createForClass(LearningSession);
