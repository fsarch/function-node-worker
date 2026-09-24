import { ModuleConfiguration } from '@fsarch/server/configuration';
import { Module } from '@nestjs/common';
import Joi from 'joi';
import { FunctionServerModule } from '../function-server/function-server.module.js';
import { FunctionExecuterService } from './function-executer.service.js';

@Module({
  providers: [FunctionExecuterService],
  exports: [FunctionExecuterService],
  imports: [
    ModuleConfiguration.register('WORKER_AUTH_CONFIG', {
      validationSchema: Joi.alternatives(
        Joi.object({
          type: Joi.string().allow('openid-client-credentials'),
          token_endpoint: Joi.string().required(),
          client_id: Joi.string().required(),
          client_secret: Joi.string().required(),
        }),
      ),
      name: 'worker_auth',
    }),
    FunctionServerModule,
  ],
})
export class FunctionExecuterModule {}
