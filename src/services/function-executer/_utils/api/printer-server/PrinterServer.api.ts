import { TApiOptions } from "../api.type.js";
import {
  WorkerMetaPrinterServerConfigDto,
} from "../../../../function-server/function-server.types.js";
import { PrintersApi } from "./Printers.api.js";

export class PrinterServerApi {
  public readonly printers: PrintersApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaPrinterServerConfigDto>,
  ) {
    this.printers = new PrintersApi(apiOptions);
  }
}