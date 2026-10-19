import { createServiceModule } from '@fsarch/server';
import { ModuleConfiguration } from '@fsarch/server/configuration';
import Joi from 'joi';
import { ExecutionsController } from '../controllers/executions/executions.controller.js';
import { FunctionExecuterService } from '../services/function-executer/function-executer.service.js';
import { FunctionServerService } from '../services/function-server/function-server.service.js';

/**
 * The service's feature module, generated via `@fsarch/server`'s
 * `createServiceModule()` instead of the previous
 * `AppModule -> {ControllersModule -> ExecutionsModule, ServicesModule} ->
 * {FunctionServerModule, FunctionExecuterModule}` tree. This service has no
 * database/entities at all (standalone `main.ts` never calls
 * `.setDatabase()`), so `entities: []` is passed - `TypeOrmModule.forFeature([])`
 * is a true no-op (zero providers, no `DataSource` injection attempted),
 * matching the existing no-DB behavior exactly.
 *
 * `FunctionServerModule`'s `ModuleConfiguration.register('FUNCTION_SERVER_CONFIG', ...)`
 * and `FunctionExecuterModule`'s `ModuleConfiguration.register('WORKER_AUTH_CONFIG', ...)`
 * keep their existing `name: 'function_server'`/`name: 'worker_auth'` config-section
 * lookups, now threaded through the generated module's `connectionName` as
 * `serviceId` (same pattern as `frontier-api`'s `WORKERS_CONFIG`), so a
 * mono-service mount reads its own `services[].config.function_server`/
 * `services[].config.worker_auth` entries instead of the flat root sections.
 */
export const FunctionNodeWorkerModule = createServiceModule({
  entities: [],
  controllers: [ExecutionsController],
  providers: [FunctionServerService, FunctionExecuterService],
  imports: (serviceId) => [
    ModuleConfiguration.register('FUNCTION_SERVER_CONFIG', {
      name: 'function_server',
      serviceId,
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
        }),
      ),
    }),
    ModuleConfiguration.register('WORKER_AUTH_CONFIG', {
      name: 'worker_auth',
      serviceId,
      validationSchema: Joi.alternatives(
        Joi.object({
          type: Joi.string().allow('openid-client-credentials'),
          token_endpoint: Joi.string().required(),
          client_id: Joi.string().required(),
          client_secret: Joi.string().required(),
        }),
      ),
    }),
  ],
});
