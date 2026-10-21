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
 * `entities`/`migrations` are empty arrays, not omitted - this service has
 * no database standalone, but `ServiceMountDescriptor` requires both
 * fields, and `FsArchAppBuilder.addService()`/`build()` unconditionally
 * wires up a named TypeORM connection per mount regardless of whether
 * `entities` is empty. A mono-service harness mounting this service still
 * needs *some* `database:` config under this mount's `services[].config`
 * entry for that connection to establish successfully, even though nothing
 * in this service ever uses it.
 */
export const descriptor = {
  module: FunctionNodeWorkerModule,
  entities: [],
  migrations: [],
  swagger: {
    title: 'Function-Server',
    description: 'The Function-Server API description',
    version: '1.0',
    path: 'docs',
  },
  auth: true,
};
