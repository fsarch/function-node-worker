// ============================================
// Add this type to src/services/function-server/function-server.types.ts
// ============================================

export type WorkerMeta{ApiName}ConfigDto = {
  type: '{api-name}';
  url: string;
  // TODO: Add additional configuration fields
  // Examples:
  // catalogId?: string;
  // warehouseId?: string;
  // apiKey?: string;
};

// ============================================
// Update the WorkerMetaApiConfigDto union
// ============================================

export type WorkerMetaApiConfigDto = 
  WorkerMetaPdfServerConfigDto |
  WorkerMetaMaterialTracingServerConfigDto |
  WorkerMetaProductServerConfigDto |
  WorkerMetaPrinterServerConfigDto |
  WorkerMeta{ApiName}ConfigDto; // <-- Add this new line
