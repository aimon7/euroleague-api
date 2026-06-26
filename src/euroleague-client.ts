import { type Competition, type EuroleagueClientOptions } from "./core/config";
import { HttpClient } from "./core/http-client";
import { BoxscoreService } from "./resources/boxscore";
import { ClubsService } from "./resources/clubs";
import { CompetitionsService } from "./resources/competitions";
import { GameMetadataService } from "./resources/game-metadata";
import { GamesService } from "./resources/games";
import { PeopleService } from "./resources/people";
import { PhasesService } from "./resources/phases";
import { PlayByPlayService } from "./resources/play-by-play";
import { PlayersService } from "./resources/players";
import { RoundsService } from "./resources/rounds";
import { ScheduleService } from "./resources/schedule";
import { SeasonsService } from "./resources/seasons";
import { ShotsService } from "./resources/shots";
import { StandingsService } from "./resources/standings";
import { TeamsService } from "./resources/teams";

export class EuroleagueClient {
  readonly boxscore: BoxscoreService;
  readonly clubs: ClubsService;
  readonly competitions: CompetitionsService;
  readonly gameMetadata: GameMetadataService;
  readonly games: GamesService;
  readonly people: PeopleService;
  readonly phases: PhasesService;
  readonly playByPlay: PlayByPlayService;
  readonly players: PlayersService;
  readonly rounds: RoundsService;
  readonly schedule: ScheduleService;
  readonly seasons: SeasonsService;
  readonly shots: ShotsService;
  readonly standings: StandingsService;
  readonly teams: TeamsService;

  readonly #http: HttpClient;

  constructor(options: EuroleagueClientOptions = {}) {
    const competition: Competition = options.competition ?? "euroleague";
    this.#http = new HttpClient({ ...options, competition });
    this.boxscore = new BoxscoreService(this.#http);
    this.clubs = new ClubsService(this.#http);
    this.competitions = new CompetitionsService(this.#http);
    this.gameMetadata = new GameMetadataService(this.#http);
    this.games = new GamesService(this.#http);
    this.people = new PeopleService(this.#http);
    this.phases = new PhasesService(this.#http);
    this.playByPlay = new PlayByPlayService(this.#http);
    this.players = new PlayersService(this.#http);
    this.rounds = new RoundsService(this.#http);
    this.schedule = new ScheduleService(this.#http);
    this.seasons = new SeasonsService(this.#http);
    this.shots = new ShotsService(this.#http);
    this.standings = new StandingsService(this.#http);
    this.teams = new TeamsService(this.#http);
  }
}

export const euroleague = new EuroleagueClient({ competition: "euroleague" });
