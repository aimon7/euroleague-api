import { Module } from '@nestjs/common';
import { BoxscoreService } from './boxscore.service';
import { BoxscoreController } from './boxscore.controller';

@Module({
  controllers: [BoxscoreController],
  providers: [BoxscoreService],
  exports: [BoxscoreService],
})
export class BoxscoreModule {}
