import { FunctionNodeWorkerModule } from './function-node-worker.module.js';

export { FunctionNodeWorkerModule };

/**
 * The frozen equivalent of this service's standalone `main.ts` builder
 * calls, as data - see `@fsarch/server`'s `ServiceMountDescriptor`. A
 * mono-service harness spreads this into `.addService({ id, ...descriptor })`;
 * the standalone `main.ts` keeps calling the builder methods directly (no
 * behavior change), just sourcing its values from here instead of
 * duplicating them.
 *
 * No `entities`/`migrations` - this service has no database.
 */
export const descriptor = {
  module: FunctionNodeWorkerModule,
  swagger: {
    title: 'Function-Server',
    description: 'The Function-Server API description',
    version: '1.0',
    path: 'docs',
  },
  auth: true,
};
