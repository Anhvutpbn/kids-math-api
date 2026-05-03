import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonQueue, LessonQueueSchema } from './schemas/lesson-queue.schema';
import { LessonQueueService } from './lesson-queue.service';
import { LessonQueueController } from './lesson-queue.controller';
import { QuestionsModule } from '../questions/questions.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonQueue.name, schema: LessonQueueSchema },
    ]),
    QuestionsModule,
    SkillsModule,
  ],
  controllers: [LessonQueueController],
  providers: [LessonQueueService],
  exports: [LessonQueueService],
})
export class LessonQueueModule {}
