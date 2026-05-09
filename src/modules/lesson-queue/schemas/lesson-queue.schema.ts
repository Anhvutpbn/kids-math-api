import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonQueueDocument = LessonQueue & Document;

export type QueueType = 'daily' | 'weekly_review' | 'skill_focus';
export type QueueStatus = 'pending' | 'in_progress' | 'done';

@Schema({ timestamps: true })
export class LessonQueue {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  questions: { questionId: string; skillId: string; difficulty: number }[];

  @Prop({ default: 'daily', enum: ['daily', 'weekly_review', 'skill_focus'] })
  queueType: QueueType;

  @Prop({ default: 'pending', enum: ['pending', 'in_progress', 'done'] })
  status: QueueStatus;
}

export const LessonQueueSchema = SchemaFactory.createForClass(LessonQueue);
LessonQueueSchema.index({ userId: 1, status: 1 });
