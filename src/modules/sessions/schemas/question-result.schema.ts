import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionResultDocument = QuestionResult & Document;

@Schema({ timestamps: true })
export class QuestionResult {
  @Prop({ type: Types.ObjectId, ref: 'LearningSession', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  skillId: string;

  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  userAnswer: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ default: 0 })
  timeSpentMs: number;

  @Prop({ default: 1, min: 1, max: 3 })
  attemptNumber: number;
}

export const QuestionResultSchema = SchemaFactory.createForClass(QuestionResult);
QuestionResultSchema.index({ sessionId: 1 });
QuestionResultSchema.index({ userId: 1, skillId: 1 });
