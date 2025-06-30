import { WorkerMetaApiConfigDto } from "../../../function-server/function-server.types.js";

export type TApiOptions<T = WorkerMetaApiConfigDto> = {
  getAccessToken: () => Promise<string>;
  config: T;
};

export type TRequestFnc<T = any> = (options: {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string;
  body?: unknown;
  queryParams?: Record<string, string | Array<string>>;
}) => Promise<T>;
