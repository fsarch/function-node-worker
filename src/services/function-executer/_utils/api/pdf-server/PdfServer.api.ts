import { TApiOptions } from "../api.type.js";
import { WorkerMetaPdfServerConfigDto } from "../../../../function-server/function-server.types.js";

type TPdfRenderOptions = {
  viewport: {
    width: number;
    height: number;
  };
  export: {

  };
};

export class PdfServerApi {
  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaPdfServerConfigDto>,
  ) {

  }

  async renderPdf(
    html: string,
    options: TPdfRenderOptions = {
      viewport: {
        width: 2480,
        height: 3508,
      },
      export: {
        format: 'A4',
      },
    },
  ) {
    const accessToken = await this.apiOptions.getAccessToken();
    const url = `${this.apiOptions.config.url}/pdf/_actions/render`;

    console.log('url', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          html,
        },
        options,
      }),
    });

    if (response.status !== 201) {
      throw new Error('error while creating pdf');
    }

    const data = await response.arrayBuffer();

    return {
      data,
    };
  }
}
