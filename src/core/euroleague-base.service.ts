import { Injectable, Logger } from '@nestjs/common';
import { EuroleagueHttpService } from './euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';

/**
 * Base service for all Euroleague API services
 * Provides common functionality for URL construction and game code retrieval
 */
@Injectable()
export class EuroleagueBaseService {
  protected readonly logger: Logger;
  protected readonly BASE_URL = 'https://api-live.euroleague.net';
  protected readonly V1 = 'v1';
  protected readonly V2 = 'v2';
  protected readonly V3 = 'v3';

  protected readonly url: string;
  protected readonly url_v1: string;
  protected readonly url_v2: string;
  protected readonly url_v3: string;

  constructor(
    protected readonly httpService: EuroleagueHttpService,
    protected readonly competition: Competition = Competition.EUROLEAGUE,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.url = `${this.BASE_URL}/${this.V3}`;
    this.url_v1 = `${this.BASE_URL}/${this.V1}/results/`;
    this.url_v2 = `${this.BASE_URL}/${this.V2}`;
    this.url_v3 = `${this.BASE_URL}/${this.V3}`;
  }

  /**
   * Construct a season game URL
   * @param season - The start year of the season
   * @param gameCode - The game code
   * @param endpoint - The API endpoint
   * @returns The full URL
   */
  protected makeSeasonGameUrl(
    season: number,
    gameCode: number,
    endpoint: string,
  ): string {
    return `${this.url}/seasondata/${this.competition}${season}/games/${gameCode}/${endpoint}`;
  }

  /**
   * Get game codes for a specific round in a season
   * @param season - The start year of the season
   * @param roundNumber - The round number
   * @returns Array of game codes
   */
  async getGamecodesRound(
    season: number,
    roundNumber: number,
  ): Promise<number[]> {
    const url = `${this.url}/seasondata/${this.competition}${season}/rounds/${roundNumber}/games`;
    const data = await this.httpService.get<{ games: { gamecode: number }[] }>(
      url,
    );
    return data.games.map((game) => game.gamecode);
  }

  /**
   * Get all game codes for a season
   * @param season - The start year of the season
   * @returns Array of game codes
   */
  async getGamecodesSeason(season: number): Promise<number[]> {
    const url = `${this.url}/seasondata/${this.competition}${season}/games`;
    const data = await this.httpService.get<{ games: { gamecode: number }[] }>(
      url,
    );
    return data.games.map((game) => game.gamecode);
  }

  /**
   * Validate endpoint value
   * @param endpoint - The endpoint to validate
   * @param validEndpoints - Array of valid endpoint values
   * @throws Error if endpoint is invalid
   */
  protected validateEndpoint(endpoint: string, validEndpoints: string[]): void {
    if (!validEndpoints.includes(endpoint)) {
      throw new Error(
        `Invalid endpoint '${endpoint}'. Valid options are: ${validEndpoints.join(', ')}`,
      );
    }
  }

  /**
   * Validate phase type code
   * @param phaseType - The phase type to validate
   * @param validPhaseTypes - Array of valid phase types
   * @throws Error if phase type is invalid
   */
  protected validatePhaseType(
    phaseType: string,
    validPhaseTypes: string[],
  ): void {
    if (!validPhaseTypes.includes(phaseType)) {
      throw new Error(
        `Invalid phase type '${phaseType}'. Valid options are: ${validPhaseTypes.join(', ')}`,
      );
    }
  }
}
