import { TApiOptions } from "../api.type.js";
import {
  WorkerMetaMaterialTracingServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { MaterialTracingPartApi } from "./MaterialTracingPart.api.js";

export class MaterialTracingServerApi {
  public readonly parts: MaterialTracingPartApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMaterialTracingServerConfigDto>,
  ) {
    this.parts = new MaterialTracingPartApi(apiOptions);
  }
}
