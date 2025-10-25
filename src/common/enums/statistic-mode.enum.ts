/**
 * Statistics aggregation mode
 */
export enum StatisticMode {
  /** Per game statistics */
  PER_GAME = 'PerGame',
  /** Accumulated statistics */
  ACCUMULATED = 'Accumulated',
  /** Per Minute statistics */
  PER_MINUTE = 'PerMinute',
  /** Per 100 possesions statistics */
  PER_100_POSSESIONS = 'Per100Possesions',
  /** Per game statistics in reverse order (for leaders like turnovers, fouls, etc.) */
  PER_GAME_REVERSE = 'PerGameReverse',
  /** Accumulated statistics in reverse order */
  ACCUMULATED_REVERSE = 'AccumulatedReverse',
}
