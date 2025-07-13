import { TApiOptions, TRequestFnc } from "../api.type.js";
import {
  WorkerMetaPrinterServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";
import {
  ReceiptDataDto,
  CreatePrintJobDto,
  PrintJobDto,
  CreateReceiptJobOptions
} from "./printer-server.types.js";

export class PrintersJobsApi {
  private readonly request: TRequestFnc;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaPrinterServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: apiOptions.config.url,
      getAccessToken: apiOptions.getAccessToken,
    });
  }

  public async createReceiptJob(
    printerId: string,
    data: Array<ReceiptDataDto>,
    options: CreateReceiptJobOptions = {}
  ): Promise<PrintJobDto> {
    // Build the CreatePrintJobDto from the provided data and options
    const createPrintJobDto: CreatePrintJobDto = {
      data: data,
    };

    if (options?.externalId) {
      createPrintJobDto.externalId = options.externalId;
    }

    const response = await this.request({
      method: 'POST',
      path: `/v1/printers/${printerId}/jobs`,
      body: createPrintJobDto,
    });

    return response as PrintJobDto;
  }
}
