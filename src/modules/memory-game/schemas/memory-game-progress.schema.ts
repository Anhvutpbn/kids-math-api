import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryGameProgressDocument = MemoryGameProgress & Document;

@Schema({ timestamps: true })
export class MemoryGameProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 1, min: 1, max: 16 })
  maxLevelUnlocked: number;

  @Prop({ type: [Number], default: [] })
  tiersCompleted: number[];
}

export const MemoryGameProgressSchema = SchemaFactory.createForClass(MemoryGameProgress);
