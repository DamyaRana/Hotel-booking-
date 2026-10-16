import { Test, TestingModule } from '@nestjs/testing';
import { AdminRoomsService } from './admin-rooms.service';

describe('AdminRoomsService', () => {
  let service: AdminRoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminRoomsService],
    }).compile();

    service = module.get<AdminRoomsService>(AdminRoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
