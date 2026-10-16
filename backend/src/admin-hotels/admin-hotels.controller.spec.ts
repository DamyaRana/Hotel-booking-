import { Test, TestingModule } from '@nestjs/testing';
import { AdminHotelsController } from './admin-hotels.controller';

describe('AdminHotelsController', () => {
  let controller: AdminHotelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHotelsController],
    }).compile();

    controller = module.get<AdminHotelsController>(AdminHotelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
