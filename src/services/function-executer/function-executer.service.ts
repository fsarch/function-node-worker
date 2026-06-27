import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FunctionDto,
  FunctionVersionDto,
  WorkerMetaApiConfigDto,
  WorkerMetaDto, WorkerMetaMaterialTracingServerConfigDto,
  WorkerMetaMetricServerConfigDto,
  WorkerMetaPdfServerConfigDto,
  WorkerMetaPrinterServerConfigDto,
  WorkerMetaProductServerConfigDto,
} from "../function-server/function-server.types.js";
import * as vm from "node:vm";
import { PdfServerApi } from "./_utils/api/pdf-server/PdfServer.api.js";
import { TApiOptions } from "./_utils/api/api.type.js";
import { ModuleConfigurationService } from "../../fsarch/configuration/module/module-configuration.service.js";
import { ConfigWorkerAuthType } from "../../types/ConfigWorkerAuth.type.js";
import { decodeJwt } from "jose";
import { serializeError } from "serialize-error";
import { MaterialTracingServerApi } from "./_utils/api/material-tracing-server/MaterialTracingServer.api.js";
import { ProductServerApi } from "./_utils/api/product-server/ProductServer.api.js";
import { FileReader } from "./file-reader/file-reader.js";
import { PrinterServerApi } from "./_utils/api/printer-server/PrinterServer.api.js";
import { MetricServerApi } from "./_utils/api/metric-server/MetricServer.api.js";
import { FunctionServerService } from "../function-server/function-server.service.js";

@Injectable()
export class FunctionExecuterService {
  private readonly logger = new Logger(FunctionExecuterService.name);

  private accessTokenCache: { accessToken: string; expirationTime: number } | undefined = undefined;

  constructor(
    @Inject('WORKER_AUTH_CONFIG')
    private readonly functionServerConfigService: ModuleConfigurationService<ConfigWorkerAuthType>,
    private readonly functionServerService: FunctionServerService,
  ) {
    this.getAccessToken = this.getAccessToken.bind(this);
  }

  private async getAccessToken() {
    if (this.accessTokenCache && this.accessTokenCache.expirationTime > (Date.now() - (60 * 1000))) {
      return this.accessTokenCache.accessToken;
    }

    const auth = this.functionServerConfigService.get();

    const requestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: auth.client_id,
      client_secret: auth.client_secret,
    });

    const response = await fetch(auth.token_endpoint, {
      method: 'POST',
      body: requestBody,
    });

    if (!response.ok) {
      this.logger.error('could not get access-token', {
        statusCode: response.status,
      });
      throw new Error('could not get access-token');
    }

    const body = await response.json();

    const accessToken = body.access_token as string;
    const claims = decodeJwt(accessToken);

    this.accessTokenCache = {
      expirationTime: new Date(claims.exp * 1000).getTime(),
      accessToken,
    }

    return accessToken;
  }

  private async createApi(workerMeta: WorkerMetaDto): Promise<Record<string, unknown>> {
    if (!workerMeta?.api) {
      return {};
    }
    const entries = (Object.entries(workerMeta.api) as unknown as Array<[string, WorkerMetaApiConfigDto]>).map(([key, value]) => {
      const apiOptions: TApiOptions = {
        getAccessToken: this.getAccessToken,
        config: value,
      }

      function isPdfServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaPdfServerConfigDto> {
        return config.config.type === 'pdf-server';
      }

      function isMaterialTracingServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaMaterialTracingServerConfigDto> {
        return config.config.type === 'material-tracing-server';
      }

      function isProductServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaProductServerConfigDto> {
        return config.config.type === 'product-server';
      }

      function isPrinterServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaPrinterServerConfigDto> {
        return config.config.type === 'printer-server';
      }

      function isMetricServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaMetricServerConfigDto> {
        return config.config.type === 'metric-server';
      }

      if (isPdfServerConfig(apiOptions)) {
        return [key, new PdfServerApi(apiOptions)];
      }

      if (isMaterialTracingServerConfig(apiOptions)) {
        return [key, new MaterialTracingServerApi(apiOptions)];
      }

      if (isProductServerConfig(apiOptions)) {
        return [key, new ProductServerApi(apiOptions)];
      }

      if (isPrinterServerConfig(apiOptions)) {
        return [key, new PrinterServerApi(apiOptions)];
      }

      if (isMetricServerConfig(apiOptions)) {
        return [key, new MetricServerApi(apiOptions)];
      }

      return [key, value];
    });

    return Object.fromEntries(entries);
  }

  public async execute(
    functionVersion: FunctionVersionDto,
    workerMeta: WorkerMetaDto,
    args: Array<unknown>,
    functionDetails?: FunctionDto,
  ) {
    const { functionId, code } = functionVersion;
    const enableDebugLogging = functionDetails?.enableDebugLogging ?? false;
    const enableErrorLogging = functionDetails?.enableErrorLogging ?? true;

    const executionLogs: Array<{ level: string; message: string; data?: unknown }> = [];

    const captureLog = (level: string, message: string, data?: unknown) => {
      executionLogs.push({ level, message, data });
    };

    const createLoggerFunction = (type: keyof typeof console) => {
      return (...logArgs: Array<unknown>) => {
        const message = logArgs.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        captureLog(type, message, logArgs.length > 0 ? logArgs[0] : undefined);
        this.logger.log('log from function', {
          logData: logArgs,
          method: type,
          functionId,
        });
      };
    };

    const fsarchApi = await this.createApi(workerMeta);

    const context = {
      console: {
        log: createLoggerFunction('log'),
        trace: createLoggerFunction('trace'),
        debug: createLoggerFunction('debug'),
        info: createLoggerFunction('info'),
        warn: createLoggerFunction('warn'),
        error: createLoggerFunction('error'),
      },
      btoa: (value: string) => Buffer.from(value, 'utf-8').toString('base64'),
      atob: (value: string) => Buffer.from(value, 'base64').toString('utf-8'),
      TextEncoder: TextEncoder,
      TextDecoder: TextDecoder,
      Blob,
      FileReader,
      fsarch: fsarchApi,
    };

    vm.createContext(context);

    const module = new vm.SourceTextModule(code, { context });

    await module.link(() => {
      throw new Error('could not find module code');
    });

    const moduleExports = (module.namespace as { run: (...args: Array<unknown>) => Promise<unknown> });

    try {
      const result = await moduleExports.run(...args);

      if (enableDebugLogging) {
        await this.functionServerService.createExecution(
          functionId,
          functionVersion.id,
          true,
          result,
          null,
          executionLogs.map(log => log.message),
          args,
        );
      }

      return {
        isError: false,
        result,
      };
    } catch (error) {
      const serializedError = serializeError(error);

      if (enableErrorLogging || enableDebugLogging) {
        await this.functionServerService.createExecution(
          functionId,
          functionVersion.id,
          false,
          null,
          serializedError,
          executionLogs.map(log => log.message),
          args,
        );
      }

      return {
        isError: true,
        error: serializedError,
      };
    }
  }
}
