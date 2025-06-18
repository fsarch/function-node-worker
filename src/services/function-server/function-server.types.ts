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

export type WorkerMetaApiConfigDto = WorkerMetaPdfServerConfigDto;

export type WorkerMetaDto = {
  api: {
    [key: string]: WorkerMetaApiConfigDto;
  };
};
