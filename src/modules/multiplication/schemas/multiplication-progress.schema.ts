import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MultiplicationProgressDocument = MultiplicationProgress & Document;

@Schema({ timestamps: true })
export class MultiplicationProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  mediumUnlocked: boolean;

  @Prop({ default: false })
  hardUnlocked: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  basicBestScore: number;

  @Prop({ default: 0, min: 0, max: 100 })
  mediumBestScore: number;

  @Prop({ default: 0, min: 0, max: 100 })
  hardBestScore: number;

  @Prop({ default: 0, min: 0 })
  basicSessionCount: number;

  @Prop({ default: 0, min: 0 })
  mediumSessionCount: number;

  @Prop({ default: 0, min: 0 })
  hardSessionCount: number;
}

export const MultiplicationProgressSchema = SchemaFactory.createForClass(MultiplicationProgress);
