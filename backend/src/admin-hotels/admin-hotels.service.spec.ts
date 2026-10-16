import { Test, TestingModule } from '@nestjs/testing';
import { AdminHotelsService } from './admin-hotels.service';

describe('AdminHotelsService', () => {
  let service: AdminHotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminHotelsService],
    }).compile();

    service = module.get<AdminHotelsService>(AdminHotelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
