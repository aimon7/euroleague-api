import { Module } from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';

@Module({
  controllers: [CoachesController],
  providers: [CoachesService],
})
export class CoachesModule {}
