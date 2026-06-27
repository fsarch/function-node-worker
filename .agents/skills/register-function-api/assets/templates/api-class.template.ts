import { TApiOptions } from "../api.type.js";
import { WorkerMeta{ApiName}ConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export class {ApiName}Api {
  private readonly request;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMeta{ApiName}ConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: this.apiOptions.config.url,
      getAccessToken: this.apiOptions.getAccessToken,
    });
  }

  // ============================================
  // TODO: Add your methods here
  // ============================================

  /**
   * Example method - replace with actual methods
   */
  async getResource(id: string) {
    return this.request({
      method: 'GET',
      path: `/resources/${id}`,
    });
  }

  /**
   * Example method for creating a resource
   */
  async createResource(data: unknown) {
    return this.request({
      method: 'POST',
      path: '/resources',
      body: data,
    });
  }
}
