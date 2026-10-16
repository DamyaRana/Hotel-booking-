import { Test, TestingModule } from '@nestjs/testing';
import { AdminRoomsController } from './admin-rooms.controller';

describe('AdminRoomsController', () => {
  let controller: AdminRoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminRoomsController],
    }).compile();

    controller = module.get<AdminRoomsController>(AdminRoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
