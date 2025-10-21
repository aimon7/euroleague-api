import { Module } from '@nestjs/common';
import { ShotDataService } from './shot-data.service';
import { ShotDataController } from './shot-data.controller';

@Module({
  controllers: [ShotDataController],
  providers: [ShotDataService],
  exports: [ShotDataService],
})
export class ShotDataModule {}
