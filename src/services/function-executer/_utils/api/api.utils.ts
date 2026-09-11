import { TRequestFnc } from "./api.type.js";

const createRequest = ({ url, getAccessToken }: { url: string; getAccessToken: () => Promise<string> }): TRequestFnc => async (
  options,
) => {
  const accessToken = await getAccessToken();

  const queryParamsArray = Object.entries(options.queryParams ?? {}).map(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((val) => [key, val]);
    }

    return [key, value];
  }).flat() as Array<[string, string]>;

  const queryParams = new URLSearchParams(queryParamsArray);
  const completeUrl = `${url}${options.path}?${queryParams.toString()}`;

  let response: Response;
  try {
    response = await fetch(completeUrl, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': options.body !== undefined ? 'application/json' : undefined,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    console.error('request to external service failed', {
      url: completeUrl,
      method: options.method,
      error,
    });
    throw error;
  }

  if (!response.ok) {
    let body = await response.json().catch(() => {});

    console.error('failed to load resource', {
      url: completeUrl,
      status: response.status,
      body,
    });
    throw new Error('failed to load resource');
  }

  const data = await response.json();

  return data;
}

export const apiUtils = {
  createRequest,
};
