import { TApiOptions } from "../api.type.js";
import { WorkerMetaMetricServerConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export type CreateMetricTypeDto = {
  name: string;
  externalId?: string;
};

export type MetricTypeDto = {
  id: string;
  name: string;
  externalId: string | null;
  creationTime: string;
};

export class MetricTypeApi {
  private readonly request;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMetricServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: this.apiOptions.config.url,
      getAccessToken: this.apiOptions.getAccessToken,
    });
  }

  /**
   * Create a new metric type
   * POST /metric-types
   */
  async create(data: CreateMetricTypeDto): Promise<MetricTypeDto> {
    return this.request({
      method: 'POST',
      path: `/metric-types`,
      body: data,
    });
  }

  /**
   * Get a single metric type by ID
   * GET /metric-types/{id}
   */
  async get(id: string): Promise<MetricTypeDto> {
    return this.request({
      method: 'GET',
      path: `/metric-types/${id}`,
    });
  }

  /**
   * Delete a metric type by ID
   * DELETE /metric-types/{id}
   */
  async delete(id: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      path: `/metric-types/${id}`,
    });
  }
}
