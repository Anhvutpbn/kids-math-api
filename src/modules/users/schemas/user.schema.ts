import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  childName: string;

  @Prop({ default: 6 })
  childAge: number;

  @Prop({ default: 'vi' })
  language: string;

  @Prop({ default: 'bear' })
  avatarId: string;

  @Prop({ default: 0 })
  totalXp: number;

  @Prop({ default: 0 })
  streakCurrent: number;

  @Prop({ default: 0 })
  streakLongest: number;

  @Prop({ type: Date, default: null })
  lastSessionDate: Date | null;

  @Prop({ default: false })
  onboardingDone: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
