export type ConfigWorkerAuthType = {
  type: 'openid-client-credentials',
  token_endpoint: string;
  client_id: string;
  client_secret: string;
};
