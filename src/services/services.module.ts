import { Module } from '@nestjs/common';
import { FunctionExecuterModule } from './function-executer/function-executer.module.js';
import { FunctionServerModule } from './function-server/function-server.module.js';

@Module({
  imports: [FunctionServerModule, FunctionExecuterModule],
})
export class ServicesModule {}
