export type FunctionVersionDto = {
  id: string;
  functionId: string;
  externalId: string | null;
  isActive: boolean;
  code: string;
  publishTime: string;
  creationTime: string;
};
