export type ConfigFunctionServerType = {
  type: 'remote';
  url: string;
  auth: {
    type: 'openid-client-credentials',
    token_endpoint: string;
    client_id: string;
    client_secret: string;
  };
};
