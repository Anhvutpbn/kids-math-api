import { Module } from '@nestjs/common';
import { PlacementTestService } from './placement-test.service';
import { PlacementTestController } from './placement-test.controller';
import { SkillsModule } from '../skills/skills.module';
import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SkillsModule, QuestionsModule, UsersModule],
  controllers: [PlacementTestController],
  providers: [PlacementTestService],
})
export class PlacementTestModule {}
