import { Module } from '@nestjs/common';
import { PlayByPlayService } from './play-by-play.service';
import { PlayByPlayController } from './play-by-play.controller';

@Module({
  controllers: [PlayByPlayController],
  providers: [PlayByPlayService],
  exports: [PlayByPlayService],
})
export class PlayByPlayModule {}
