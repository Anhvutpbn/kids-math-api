import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'min_max';

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  skillId: string;

  @Prop({ required: true, enum: ['multiple_choice', 'fill_blank', 'min_max'] })
  type: QuestionType;

  @Prop({ required: true })
  questionVi: string;

  @Prop()
  questionEn: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ default: 1, min: 1, max: 3 })
  difficulty: number;

  @Prop()
  hintVi: string;

  @Prop()
  imagePath: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({ skillId: 1, difficulty: 1 });
