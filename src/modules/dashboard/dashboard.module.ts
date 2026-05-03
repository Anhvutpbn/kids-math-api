import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { SkillsModule } from '../skills/skills.module';
import { BadgesModule } from '../badges/badges.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [SessionsModule, SkillsModule, BadgesModule, AiModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
