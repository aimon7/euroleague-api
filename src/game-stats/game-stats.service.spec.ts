import { Test, TestingModule } from '@nestjs/testing';
import { GameStatsService } from './game-stats.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { GameStatsEndpoint } from './dto/get-game-stats.dto';

describe('GameStatsService', () => {
  let service: GameStatsService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameStatsService,
        {
          provide: EuroleagueHttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<GameStatsService>(GameStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGameStats', () => {
    it('should fetch game stats successfully', async () => {
      const mockData = { team1: 'Team A', team2: 'Team B', score: '80-75' };
      mockHttpService.get.mockResolvedValue(mockData);

      const result = await service.getGameStats(
        2023,
        1,
        GameStatsEndpoint.STATS,
      );

      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('E2023/games/1/stats'),
      );
    });

    it('should throw error for invalid endpoint', async () => {
      await expect(
        service.getGameStats(2023, 1, 'invalid' as any),
      ).rejects.toThrow();
    });
  });

  describe('getGameReport', () => {
    it('should fetch game report', async () => {
      const mockData = { report: 'Game Report' };
      mockHttpService.get.mockResolvedValue(mockData);

      const result = await service.getGameReport(2023, 1);

      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('report'),
      );
    });
  });

  describe('getGameTeamsComparison', () => {
    it('should fetch teams comparison', async () => {
      const mockData = { comparison: 'Teams Comparison' };
      mockHttpService.get.mockResolvedValue(mockData);

      const result = await service.getGameTeamsComparison(2023, 1);

      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('teamsComparison'),
      );
    });
  });

  describe('getSeasonGameStats', () => {
    it('should fetch stats for all games in a season', async () => {
      const mockGameCodes = { games: [{ gamecode: 1 }, { gamecode: 2 }] };
      const mockGameData = { stats: 'data' };

      mockHttpService.get
        .mockResolvedValueOnce(mockGameCodes) // For getGamecodesSeason
        .mockResolvedValueOnce(mockGameData) // For game 1
        .mockResolvedValueOnce(mockGameData); // For game 2

      const result = await service.getSeasonGameStats(2023);

      expect(result).toHaveLength(2);
      expect(mockHttpService.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('getRoundGameStats', () => {
    it('should fetch stats for all games in a round', async () => {
      const mockGameCodes = { games: [{ gamecode: 1 }] };
      const mockGameData = { stats: 'data' };

      mockHttpService.get
        .mockResolvedValueOnce(mockGameCodes) // For getGamecodesRound
        .mockResolvedValueOnce(mockGameData); // For game 1

      const result = await service.getRoundGameStats(2023, 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('roundNumber', 1);
    });
  });

  describe('getRangeSeasonsGameStats', () => {
    it('should fetch stats for a range of seasons', async () => {
      const mockGameCodes = { games: [{ gamecode: 1 }] };
      const mockGameData = { stats: 'data' };

      // Mock calls for 2 seasons
      mockHttpService.get
        .mockResolvedValueOnce(mockGameCodes) // Season 2022 gamecodes
        .mockResolvedValueOnce(mockGameData) // Season 2022 game 1
        .mockResolvedValueOnce(mockGameCodes) // Season 2023 gamecodes
        .mockResolvedValueOnce(mockGameData); // Season 2023 game 1

      const result = await service.getRangeSeasonsGameStats(2022, 2023);

      expect(result).toHaveLength(2);
      expect(mockHttpService.get).toHaveBeenCalledTimes(4);
    });
  });
});
