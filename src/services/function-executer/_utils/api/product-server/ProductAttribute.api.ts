import { TApiOptions, TRequestFnc } from "../api.type.js";
import {
  WorkerMetaProductServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";
import { ProductAttributeElementApi } from "./ProductAttributeElement.api.js";

export class ProductAttributeApi {
  private readonly request: TRequestFnc;
  public readonly elements: ProductAttributeElementApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: apiOptions.config.url,
      getAccessToken: apiOptions.getAccessToken,
    });

    this.elements = new ProductAttributeElementApi(apiOptions);
  }

}
