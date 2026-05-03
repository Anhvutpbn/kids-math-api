import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SkillsModule } from '../skills/skills.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LessonQueueModule } from '../lesson-queue/lesson-queue.module';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';
import { ErrorClassifier } from './strategies/error-classifier';
import { MasteryCalculator } from './strategies/mastery-calculator';

@Module({
  imports: [SkillsModule, SessionsModule, LessonQueueModule, UsersModule, BadgesModule],
  controllers: [AiController],
  providers: [AiService, ErrorClassifier, MasteryCalculator],
  exports: [AiService],
})
export class AiModule {}
