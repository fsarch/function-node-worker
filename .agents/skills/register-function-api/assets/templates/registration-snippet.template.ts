// ============================================
// Add this import to src/services/function-executer/function-executer.service.ts
// ============================================

import { {ApiName}Api } from "./_utils/api/{api-name}/{ApiName}.api.js";

// ============================================
// Insert this code in the createApi() method (before the return statement)
// ============================================

function is{ApiName}Config(config: TApiOptions): config is TApiOptions<WorkerMeta{ApiName}ConfigDto> {
  return config.config.type === '{api-name}';
}

if (is{ApiName}Config(apiOptions)) {
  return [key, new {ApiName}Api(apiOptions)];
}
