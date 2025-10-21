import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EuroleagueHttpService } from './euroleague-http.service';

/**
 * Core module that provides HTTP services globally
 * This module is marked as @Global so it doesn't need to be imported in every feature module
 */
@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 5,
    }),
  ],
  providers: [EuroleagueHttpService],
  exports: [EuroleagueHttpService, HttpModule],
})
export class CoreModule {}
