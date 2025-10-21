import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

/**
 * Custom logger for the Euroleague API
 * Implements NestJS LoggerService interface
 */
@Injectable()
export class EuroleagueLogger implements LoggerService {
  private context?: string;
  private isEnabled = true;

  setContext(context: string) {
    this.context = context;
  }

  setLogLevels(_levels: LogLevel[]) {
    // Can be extended to filter log levels
  }

  log(message: string, context?: string) {
    if (!this.isEnabled) return;
    const ctx = context || this.context || 'EuroleagueAPI';
    console.log(`[${new Date().toISOString()}] [LOG] [${ctx}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    if (!this.isEnabled) return;
    const ctx = context || this.context || 'EuroleagueAPI';
    console.error(`[${new Date().toISOString()}] [ERROR] [${ctx}] ${message}`);
    if (trace) {
      console.error(
        `[${new Date().toISOString()}] [ERROR] [${ctx}] Trace: ${trace}`,
      );
    }
  }

  warn(message: string, context?: string) {
    if (!this.isEnabled) return;
    const ctx = context || this.context || 'EuroleagueAPI';
    console.warn(`[${new Date().toISOString()}] [WARN] [${ctx}] ${message}`);
  }

  debug(message: string, context?: string) {
    if (!this.isEnabled) return;
    const ctx = context || this.context || 'EuroleagueAPI';
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${ctx}] ${message}`);
  }

  verbose(message: string, context?: string) {
    if (!this.isEnabled) return;
    const ctx = context || this.context || 'EuroleagueAPI';
    console.log(`[${new Date().toISOString()}] [VERBOSE] [${ctx}] ${message}`);
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}
