import { Module } from '@nestjs/common';
import { FunctionExecuterService } from './function-executer.service.js';

@Module({
  providers: [FunctionExecuterService],
  exports: [FunctionExecuterService],
})
export class FunctionExecuterModule {}
