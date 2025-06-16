import { Test, TestingModule } from '@nestjs/testing';
import { FunctionServerService } from './function-server.service.js';

describe('FunctionServerService', () => {
  let service: FunctionServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunctionServerService],
    }).compile();

    service = module.get<FunctionServerService>(FunctionServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
