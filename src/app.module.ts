import { Module } from '@nestjs/common';
import { ControllersModule } from './controllers/controllers.module.js';
import { ServicesModule } from './services/services.module.js';

@Module({
  imports: [ControllersModule, ServicesModule],
})
export class AppModule {}
