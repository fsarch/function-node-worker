import { TApiOptions, TRequestFnc } from "../api.type.js";
import {
  WorkerMetaProductServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export class ProductItemApi {
  private readonly request: TRequestFnc;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: apiOptions.config.url,
      getAccessToken: apiOptions.getAccessToken,
    });
  }

  public async get(itemId: string) {
    const response = this.request({
      method: 'GET',
      path: `/v1/catalogs/${this.apiOptions.config.catalogId}/items/${itemId}`,
    });

    return response;
  }
}
