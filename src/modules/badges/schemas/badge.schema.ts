import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BadgeDocument = Badge & Document;

@Schema({ timestamps: true })
export class Badge {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  nameVi: string;

  @Prop()
  nameEn: string;

  @Prop({ required: true })
  conditionType: string;

  @Prop({ required: true })
  conditionValue: string;

  @Prop()
  descriptionVi: string;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
