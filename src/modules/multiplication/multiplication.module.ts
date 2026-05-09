import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MultiplicationController } from './multiplication.controller';
import { MultiplicationService } from './multiplication.service';
import {
  MultiplicationSession,
  MultiplicationSessionSchema,
} from './schemas/multiplication-session.schema';
import {
  MultiplicationProgress,
  MultiplicationProgressSchema,
} from './schemas/multiplication-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MultiplicationSession.name, schema: MultiplicationSessionSchema },
      { name: MultiplicationProgress.name, schema: MultiplicationProgressSchema },
    ]),
  ],
  controllers: [MultiplicationController],
  providers: [MultiplicationService],
  exports: [MultiplicationService],
})
export class MultiplicationModule {}
