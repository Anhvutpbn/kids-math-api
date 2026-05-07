import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryGameController } from './memory-game.controller';
import { MemoryGameService } from './memory-game.service';
import { MemoryGameResult, MemoryGameResultSchema } from './schemas/memory-game-result.schema';
import { MemoryGameProgress, MemoryGameProgressSchema } from './schemas/memory-game-progress.schema';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MemoryGameResult.name, schema: MemoryGameResultSchema },
      { name: MemoryGameProgress.name, schema: MemoryGameProgressSchema },
    ]),
    BadgesModule,
  ],
  controllers: [MemoryGameController],
  providers: [MemoryGameService],
  exports: [MemoryGameService],
})
export class MemoryGameModule {}
