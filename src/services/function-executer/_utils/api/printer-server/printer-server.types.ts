// Receipt Data DTOs - These define the structure for different types of receipt data

export type AlignmentReceiptDataDto = {
  type: 'alignment';
  alignment: 'left' | 'center' | 'right';
};

export type TextReceiptDataDto = {
  type: 'text';
  text: string;
  fontSize?: 'small' | 'normal' | 'large';
  bold?: boolean;
};

export type CutReceiptDataDto = {
  type: 'cut';
  cutType?: 'full' | 'partial';
};

export type NewlineReceiptDataDto = {
  type: 'newline';
  count?: number;
};

// Union type for all receipt data types
export type ReceiptDataDto = 
  | AlignmentReceiptDataDto 
  | TextReceiptDataDto 
  | CutReceiptDataDto 
  | NewlineReceiptDataDto;

// DTO for creating a print job
export type CreatePrintJobDto = {
  data: ReceiptDataDto[];
  externalId?: string;
};

// DTO for print job response
export type PrintJobDto = {
  id: string;
  printerId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: ReceiptDataDto[];
  externalId?: string;
  createdAt: string;
  updatedAt: string;
};

// Options for createReceiptJob method
export type CreateReceiptJobOptions = {
  externalId?: string;
};