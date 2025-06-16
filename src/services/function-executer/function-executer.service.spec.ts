import { Test, TestingModule } from '@nestjs/testing';
import { FunctionExecuterService } from './function-executer.service.js';

describe('FunctionExecuterService', () => {
  let service: FunctionExecuterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunctionExecuterService],
    }).compile();

    service = module.get<FunctionExecuterService>(FunctionExecuterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
