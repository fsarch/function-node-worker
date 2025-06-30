import { TApiOptions } from "../api.type.js";
import {
  WorkerMetaProductServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { ProductItemApi } from "./ProductItem.api.js";
import { ProductAttributeApi } from "./ProductAttribute.api.js";

export class ProductServerApi {
  public readonly items: ProductItemApi;
  public readonly attributes: ProductAttributeApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {
    this.items = new ProductItemApi(apiOptions);
    this.attributes = new ProductAttributeApi(apiOptions);
  }
}
