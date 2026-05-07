import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryGameResultDocument = MemoryGameResult & Document;

@Schema({ timestamps: true })
export class MemoryGameResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 16 })
  level: number;

  @Prop({ required: true, min: 1, max: 5 })
  tier: number;

  @Prop({ required: true })
  numBoxes: number;

  @Prop({ required: true })
  mistakesAllowed: number;

  @Prop({ required: true, min: 0 })
  mistakesMade: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true, min: 0 })
  durationMs: number;
}

export const MemoryGameResultSchema = SchemaFactory.createForClass(MemoryGameResult);
