import { Test, TestingModule } from '@nestjs/testing';
import { FunctionServerService } from '../function-server/function-server.service.js';
import { FunctionExecuterService } from './function-executer.service.js';

describe('FunctionExecuterService', () => {
  let service: FunctionExecuterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunctionExecuterService,
        { provide: 'WORKER_AUTH_CONFIG', useValue: { get: () => ({}) } },
        { provide: FunctionServerService, useValue: {} },
      ],
    }).compile();

    service = module.get<FunctionExecuterService>(FunctionExecuterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
