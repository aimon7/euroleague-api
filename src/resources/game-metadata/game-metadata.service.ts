import { BaseResource } from "../../core/base-resource";
import type { HttpClient } from "../../core/http-client";

import type {
  GameMetadataGameParams,
  GameMetadataRoundParams,
  GameMetadataSeasonParams,
  GameMetadataSeasonsParams
} from "./game-metadata.dto";
import { type GameMetadata, GameMetadataSchema } from "./game-metadata.schema";

export class GameMetadataService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getGame({ gameCode, season }: GameMetadataGameParams): Promise<GameMetadata> {
    const data = await this.http.getLiveFeed("Header", { gameCode, season });

    return this.parseRecord(GameMetadataSchema, data, "Header");
  }

  async getRound({ round, season }: GameMetadataRoundParams): Promise<GameMetadata[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGameAsArray(s, code));
  }

  async getSeason({ season }: GameMetadataSeasonParams): Promise<GameMetadata[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGameAsArray(s, code));
  }

  async getSeasons({ from, to }: GameMetadataSeasonsParams): Promise<GameMetadata[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGameAsArray(s, code));
  }

  private async loadGameAsArray(season: number, gameCode: number): Promise<GameMetadata[]> {
    return [await this.getGame({ gameCode, season })];
  }
}
