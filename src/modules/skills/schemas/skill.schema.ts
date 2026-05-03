import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true, unique: true })
  id: string; // SK01..SK07

  @Prop({ required: true })
  nameVi: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop()
  descriptionVi: string;

  @Prop({ type: [String], default: [] })
  dependsOn: string[];

  @Prop({ default: 1 })
  order: number;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
