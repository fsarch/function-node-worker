import { Module } from '@nestjs/common';
import { FunctionExecuterModule } from '../../services/function-executer/function-executer.module.js';
import { FunctionServerModule } from '../../services/function-server/function-server.module.js';
import { ExecutionsController } from './executions.controller.js';

@Module({
  controllers: [ExecutionsController],
  imports: [FunctionServerModule, FunctionExecuterModule],
})
export class ExecutionsModule {}
