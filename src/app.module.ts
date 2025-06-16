import { Module } from '@nestjs/common';
import { FsarchModule } from './fsarch/fsarch.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ControllersModule } from './controllers/controllers.module.js';
import { ServicesModule } from './services/services.module.js';

@Module({
  imports: [
    FsarchModule.register({
      auth: {},
    }),
    EventEmitterModule.forRoot(),
    ControllersModule,
    ServicesModule,
  ],
})
export class AppModule {}
