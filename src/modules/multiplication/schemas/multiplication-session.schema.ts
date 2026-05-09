import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MultiplicationSessionDocument = MultiplicationSession & Document;

@Schema({ timestamps: true })
export class MultiplicationSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['basic', 'medium', 'hard'] })
  level: string;

  @Prop({ required: true, min: 0 })
  correctCount: number;

  @Prop({ required: true, min: 1, max: 20 })
  totalCount: number;

  @Prop({ required: true, min: 0, max: 3 })
  heartsLeft: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true, min: 0 })
  durationMs: number;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;
}

export const MultiplicationSessionSchema = SchemaFactory.createForClass(MultiplicationSession);
