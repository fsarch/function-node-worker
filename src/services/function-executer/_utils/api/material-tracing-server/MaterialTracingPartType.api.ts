import { TApiOptions, TRequestFnc } from "../api.type.js";
import {
  WorkerMetaMaterialTracingServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export class MaterialTracingPartTypeApi {
  private readonly request: TRequestFnc;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMaterialTracingServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: apiOptions.config.url,
      getAccessToken: apiOptions.getAccessToken,
    });
  }

  public async get(partTypeId: string) {
    const response = this.request({
      method: 'GET',
      path: `/v1/part-types/${partTypeId}`,
    });

    return response;
  }
}
