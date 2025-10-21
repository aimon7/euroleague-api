import { Module } from '@nestjs/common';
import { GameMetadataService } from './game-metadata.service';
import { GameMetadataController } from './game-metadata.controller';

@Module({
  controllers: [GameMetadataController],
  providers: [GameMetadataService],
  exports: [GameMetadataService],
})
export class GameMetadataModule {}
