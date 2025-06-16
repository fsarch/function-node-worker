import { Module } from '@nestjs/common';
import { FunctionServerService } from './function-server.service.js';
import { ModuleConfiguration } from "../../fsarch/configuration/module/module-configuration.module.js";
import Joi from "joi";

@Module({
  providers: [FunctionServerService],
  exports: [FunctionServerService],
  imports: [
    ModuleConfiguration.register('FUNCTION_SERVER_CONFIG', {
      validationSchema: Joi.alternatives(
        Joi.object({
          type: Joi.string().allow('remote').required(),
          url: Joi.string().required(),
          auth: Joi.object({
            type: Joi.string().allow('openid-client-credentials'),
            token_endpoint: Joi.string().required(),
            client_id: Joi.string().required(),
            client_secret: Joi.string().required(),
          }).required(),
        })
      ),
      name: 'function_server',
    }),
  ],
})
export class FunctionServerModule {}
