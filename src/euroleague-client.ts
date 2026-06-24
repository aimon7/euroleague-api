import { type Competition, type EuroleagueClientOptions } from "./core/config";
import { HttpClient } from "./core/http-client";
import { PlayersService } from "./resources/players";

export class EuroleagueClient {
  readonly players: PlayersService;

  readonly #http: HttpClient;

  constructor(options: EuroleagueClientOptions = {}) {
    const competition: Competition = options.competition ?? "euroleague";
    this.#http = new HttpClient({ ...options, competition });
    this.players = new PlayersService(this.#http);
  }
}

export const euroleague = new EuroleagueClient({ competition: "euroleague" });
