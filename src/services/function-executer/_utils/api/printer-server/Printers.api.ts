import { TApiOptions } from "../api.type.js";
import {
  WorkerMetaPrinterServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { PrintersJobsApi } from "./PrintersJobs.api.js";

export class PrintersApi {
  public readonly jobs: PrintersJobsApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaPrinterServerConfigDto>,
  ) {
    this.jobs = new PrintersJobsApi(apiOptions);
  }
}