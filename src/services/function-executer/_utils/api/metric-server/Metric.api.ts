import { TApiOptions } from "../api.type.js";
import { WorkerMetaMetricServerConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export type CreateMetricDto = {
  name: string;
  metricTypeId: string;
  externalId?: string;
};

export type MetricDto = {
  id: string;
  name: string;
  metricTypeId: string;
  externalId: string | null;
  creationTime: string;
};

export class MetricApi {
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
   * Create a new metric
   * POST /metrics
   */
  async create(data: CreateMetricDto): Promise<MetricDto> {
    return this.request({
      method: 'POST',
      path: `/metrics`,
      body: data,
    });
  }

  /**
   * Get a single metric by ID
   * GET /metrics/{id}
   */
  async get(id: string): Promise<MetricDto> {
    return this.request({
      method: 'GET',
      path: `/metrics/${id}`,
    });
  }

  /**
   * Delete a metric by ID
   * DELETE /metrics/{id}
   */
  async delete(id: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      path: `/metrics/${id}`,
    });
  }
}
