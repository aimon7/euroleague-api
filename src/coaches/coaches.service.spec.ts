import { Test, TestingModule } from '@nestjs/testing';
import { CoachesService } from './coaches.service';

describe('CoachesService', () => {
  let service: CoachesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoachesService],
    }).compile();

    service = module.get<CoachesService>(CoachesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
