import { type Competition, type EuroleagueClientOptions } from "./core/config";
import { HttpClient } from "./core/http-client";
import { BoxscoreService } from "./resources/boxscore";
import { GameMetadataService } from "./resources/game-metadata";
import { GamesService } from "./resources/games";
import { PlayByPlayService } from "./resources/play-by-play";
import { PlayersService } from "./resources/players";
import { ScheduleService } from "./resources/schedule";
import { ShotsService } from "./resources/shots";
import { StandingsService } from "./resources/standings";
import { TeamsService } from "./resources/teams";

export class EuroleagueClient {
  readonly boxscore: BoxscoreService;
  readonly gameMetadata: GameMetadataService;
  readonly games: GamesService;
  readonly playByPlay: PlayByPlayService;
  readonly players: PlayersService;
  readonly schedule: ScheduleService;
  readonly shots: ShotsService;
  readonly standings: StandingsService;
  readonly teams: TeamsService;

  readonly #http: HttpClient;

  constructor(options: EuroleagueClientOptions = {}) {
    const competition: Competition = options.competition ?? "euroleague";
    this.#http = new HttpClient({ ...options, competition });
    this.players = new PlayersService(this.#http);
    this.teams = new TeamsService(this.#http);
    this.standings = new StandingsService(this.#http);
    this.schedule = new ScheduleService(this.#http);
    this.games = new GamesService(this.#http);
    this.shots = new ShotsService(this.#http);
    this.boxscore = new BoxscoreService(this.#http);
    this.playByPlay = new PlayByPlayService(this.#http);
    this.gameMetadata = new GameMetadataService(this.#http);
  }
}

export const euroleague = new EuroleagueClient({ competition: "euroleague" });
