import { Module } from '@nestjs/common';
import { FunctionServerModule } from "./function-server/function-server.module.js";
import { FunctionExecuterModule } from './function-executer/function-executer.module.js';

@Module({
  imports: [FunctionServerModule, FunctionExecuterModule],
})
export class ServicesModule {}
