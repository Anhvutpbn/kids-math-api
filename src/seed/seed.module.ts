import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Skill, SkillSchema } from '../modules/skills/schemas/skill.schema';
import { Question, QuestionSchema } from '../modules/questions/schemas/question.schema';
import { Badge, BadgeSchema } from '../modules/badges/schemas/badge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Skill.name, schema: SkillSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Badge.name, schema: BadgeSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
