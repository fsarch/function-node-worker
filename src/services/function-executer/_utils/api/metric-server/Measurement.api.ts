import { TApiOptions } from "../api.type.js";
import { WorkerMetaMetricServerConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export type CreateMeasurementDto = {
  metricId: string;
  logTime: string | Date;
  value: number;
  meta?: Record<string, unknown>;
};

export type MeasurementDto = {
  metricId: string;
  logTime: string;
  value: number;
  meta: Record<string, unknown> | null;
};

export type BulkCreateMeasurementResultDto = Array<{
  metricId: string;
  logTime: string;
}>;

export type AggregateMeasurementsDto = {
  startTime: string | Date;
  endTime: string | Date;
  interval: 'hour' | 'day' | 'week' | 'month';
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
};

export type AggregatedMeasurementDto = {
  startTime: string;
  endTime: string;
  value: number;
};

export class MeasurementApi {
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
   * Create a single measurement for a specific metric
   * POST /metrics/{metricId}/measurements
   */
  async create(metricId: string, data: CreateMeasurementDto): Promise<MeasurementDto> {
    return this.request({
      method: 'POST',
      path: `/metrics/${metricId}/measurements`,
      body: data,
    });
  }

  /**
   * Bulk create multiple measurements
   * POST /measurements/_actions/bulk
   */
  async bulkCreate(measurements: Array<CreateMeasurementDto>): Promise<BulkCreateMeasurementResultDto> {
    return this.request({
      method: 'POST',
      path: `/measurements/_actions/bulk`,
      body: measurements,
    });
  }

  /**
   * Aggregate measurements for a specific metric
   * POST /metrics/{metricId}/measurements/_actions/aggregate
   */
  async aggregate(
    metricId: string,
    data: AggregateMeasurementsDto,
  ): Promise<Array<AggregatedMeasurementDto>> {
    return this.request({
      method: 'POST',
      path: `/metrics/${metricId}/measurements/_actions/aggregate`,
      body: data,
    });
  }
}
