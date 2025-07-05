import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FunctionVersionDto,
  WorkerMetaApiConfigDto,
  WorkerMetaDto, WorkerMetaMaterialTracingServerConfigDto,
  WorkerMetaPdfServerConfigDto, WorkerMetaProductServerConfigDto
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

@Injectable()
export class FunctionExecuterService {
  private readonly logger = new Logger(FunctionExecuterService.name);

  private accessTokenCache: { accessToken: string; expirationTime: number } | undefined = undefined;

  constructor(
    @Inject('WORKER_AUTH_CONFIG')
    private readonly functionServerConfigService: ModuleConfigurationService<ConfigWorkerAuthType>,
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

      if (isPdfServerConfig(apiOptions)) {
        return [key, new PdfServerApi(apiOptions)];
      }

      if (isMaterialTracingServerConfig(apiOptions)) {
        return [key, new MaterialTracingServerApi(apiOptions)];
      }

      if (isProductServerConfig(apiOptions)) {
        return [key, new ProductServerApi(apiOptions)];
      }

      return [key, value];
    });

    return Object.fromEntries(entries);
  }

  public async execute(functionVersion: FunctionVersionDto, workerMeta: WorkerMetaDto, args: Array<unknown>) {
    const { functionId, code } = functionVersion;

    const createLoggerFunction = (type: keyof typeof console) => {
      return (...args) => {
        this.logger.log('log from function', {
          logData: args,
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
      btoa: (value) => Buffer.from(value, 'utf-8').toString('base64'),
      atob: (value) => Buffer.from(value, 'base64').toString('utf-8'),
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
      return {
        isError: false,
        result: await moduleExports.run(...args),
      };
    } catch (error) {
      return {
        isError: true,
        error: serializeError(error),
      };
    }
  }
}
