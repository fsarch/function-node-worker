import { WorkerMetaApiConfigDto } from "../../../function-server/function-server.types.js";

export type TApiOptions<T = WorkerMetaApiConfigDto> = {
  getAccessToken: () => Promise<string>;
  config: T;
};
