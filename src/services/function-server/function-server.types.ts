export type FunctionVersionDto = {
  id: string;
  functionId: string;
  externalId: string | null;
  isActive: boolean;
  code: string;
  publishTime: string;
  creationTime: string;
};

export type WorkerMetaPdfServerConfigDto = {
  type: 'pdf-server',
  url: string;
};

export type WorkerMetaMaterialTracingServerConfigDto = {
  type: 'material-tracing-server',
  url: string;
};

export type WorkerMetaProductServerConfigDto = {
  type: 'product-server',
  url: string;
  catalogId: string;
};

export type WorkerMetaApiConfigDto = WorkerMetaPdfServerConfigDto | WorkerMetaMaterialTracingServerConfigDto | WorkerMetaProductServerConfigDto;

export type WorkerMetaDto = {
  api: {
    [key: string]: WorkerMetaApiConfigDto;
  };
};
