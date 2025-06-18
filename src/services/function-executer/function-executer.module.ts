import { Module } from '@nestjs/common';
import { FunctionExecuterService } from './function-executer.service.js';
import { ModuleConfiguration } from "../../fsarch/configuration/module/module-configuration.module.js";
import Joi from "joi";

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
        })
      ),
      name: 'worker_auth',
    }),
  ],
})
export class FunctionExecuterModule {}
