import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningSession, SessionSchema } from './schemas/session.schema';
import { QuestionResult, QuestionResultSchema } from './schemas/question-result.schema';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { LessonQueueModule } from '../lesson-queue/lesson-queue.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningSession.name, schema: SessionSchema },
      { name: QuestionResult.name, schema: QuestionResultSchema },
    ]),
    LessonQueueModule,
    QuestionsModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
