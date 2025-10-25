import { Test, TestingModule } from '@nestjs/testing';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';

describe('CoachesController', () => {
  let controller: CoachesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoachesController],
      providers: [CoachesService],
    }).compile();

    controller = module.get<CoachesController>(CoachesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
