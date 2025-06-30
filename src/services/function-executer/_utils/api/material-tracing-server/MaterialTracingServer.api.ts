import { TApiOptions } from "../api.type.js";
import {
  WorkerMetaMaterialTracingServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { MaterialTracingPartApi } from "./MaterialTracingPart.api.js";
import { MaterialTracingPartTypeApi } from "./MaterialTracingPartType.api.js";

export class MaterialTracingServerApi {
  public readonly parts: MaterialTracingPartApi;
  public readonly partTypes: MaterialTracingPartTypeApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMaterialTracingServerConfigDto>,
  ) {
    this.parts = new MaterialTracingPartApi(apiOptions);
    this.partTypes = new MaterialTracingPartTypeApi(apiOptions);
  }
}
