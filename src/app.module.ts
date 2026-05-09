import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SkillsModule } from './modules/skills/skills.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { LessonQueueModule } from './modules/lesson-queue/lesson-queue.module';
import { AiModule } from './modules/ai/ai.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BadgesModule } from './modules/badges/badges.module';
import { PlacementTestModule } from './modules/placement-test/placement-test.module';
import { HealthModule } from './health/health.module';
import { SeedModule } from './seed/seed.module';
import { MemoryGameModule } from './modules/memory-game/memory-game.module';
import { MultiplicationModule } from './modules/multiplication/multiplication.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 100 },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets'),
      serveRoot: '/static',
    }),
    TerminusModule,
    DatabaseModule,
    SeedModule,
    AuthModule,
    UsersModule,
    SkillsModule,
    QuestionsModule,
    SessionsModule,
    LessonQueueModule,
    AiModule,
    DashboardModule,
    BadgesModule,
    PlacementTestModule,
    MemoryGameModule,
    MultiplicationModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
