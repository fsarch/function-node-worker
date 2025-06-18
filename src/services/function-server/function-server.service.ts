import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleConfigurationService } from "../../fsarch/configuration/module/module-configuration.service.js";
import { ConfigFunctionServerType } from "../../types/ConfigFunctionServerType.type.js";
import { decodeJwt } from "jose";
import { FunctionVersionDto, WorkerMetaDto } from "./function-server.types.js";

@Injectable()
export class FunctionServerService {
  private readonly logger = new Logger(FunctionServerService.name);

  private accessTokenCache: { accessToken: string; expirationTime: number } | undefined = undefined;

  constructor(
    @Inject('FUNCTION_SERVER_CONFIG')
    private readonly functionServerConfigService: ModuleConfigurationService<ConfigFunctionServerType>,
  ) {}

  public async getAccessToken() {
    if (this.accessTokenCache && this.accessTokenCache.expirationTime > (Date.now() - (60 * 1000))) {
      return this.accessTokenCache.accessToken;
    }

    const { auth } = this.functionServerConfigService.get();

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

  public async getWorkerMetadata(): Promise<WorkerMetaDto> {
    const accessToken = await this.getAccessToken();

    const { url } = this.functionServerConfigService.get();

    const response = await fetch(`${url}/v1/.meta/worker`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseBody = await response.json();

    return responseBody;
  }

  public async getVersion(functionId: string, versionId: string = 'active'): Promise<FunctionVersionDto> {
    const accessToken = await this.getAccessToken();

    const { url } = this.functionServerConfigService.get();

    const response = await fetch(`${url}/v1/functions/${functionId}/versions/${versionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseBody = await response.json();

    return responseBody;
  }
}
