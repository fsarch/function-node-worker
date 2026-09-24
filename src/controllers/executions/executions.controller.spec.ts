import { Test, TestingModule } from '@nestjs/testing';
import { FunctionExecuterService } from '../../services/function-executer/function-executer.service.js';
import { FunctionServerService } from '../../services/function-server/function-server.service.js';
import { ExecutionsController } from './executions.controller.js';

describe('ExecutionsController', () => {
  let controller: ExecutionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionsController],
      providers: [
        { provide: FunctionServerService, useValue: {} },
        { provide: FunctionExecuterService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ExecutionsController>(ExecutionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
