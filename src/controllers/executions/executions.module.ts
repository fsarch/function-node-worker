import { Module } from '@nestjs/common';
import { ExecutionsController } from './executions.controller.js';
import { FunctionServerModule } from "../../services/function-server/function-server.module.js";
import { FunctionExecuterModule } from "../../services/function-executer/function-executer.module.js";

@Module({
  controllers: [ExecutionsController],
  imports: [FunctionServerModule, FunctionExecuterModule],
})
export class ExecutionsModule {}
