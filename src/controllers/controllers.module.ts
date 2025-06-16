import { Module } from '@nestjs/common';
import { ExecutionsModule } from './executions/executions.module.js';

@Module({

  imports: [ExecutionsModule]
})
export class ControllersModule {}
