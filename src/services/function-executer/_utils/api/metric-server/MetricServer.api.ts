import { TApiOptions } from "../api.type.js";
import { WorkerMetaMetricServerConfigDto } from "../../../../function-server/function-server.types.js";
import { MetricApi } from "./Metric.api.js";
import { MeasurementApi } from "./Measurement.api.js";
import { MetricTypeApi } from "./MetricType.api.js";

// Re-export types from sub-APIs
export type {
  CreateMetricDto,
  MetricDto,
} from "./Metric.api.js";

export type {
  CreateMeasurementDto,
  MeasurementDto,
  BulkCreateMeasurementResultDto,
  AggregateMeasurementsDto,
  AggregatedMeasurementDto,
} from "./Measurement.api.js";

export type {
  CreateMetricTypeDto,
  MetricTypeDto,
} from "./MetricType.api.js";

export class MetricServerApi {
  public readonly metrics: MetricApi;
  public readonly measurements: MeasurementApi;
  public readonly metricTypes: MetricTypeApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMetricServerConfigDto>,
  ) {
    this.metrics = new MetricApi(apiOptions);
    this.measurements = new MeasurementApi(apiOptions);
    this.metricTypes = new MetricTypeApi(apiOptions);
  }
}
