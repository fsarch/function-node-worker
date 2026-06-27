---
name: register-function-api
description: Guides registration of new APIs in Function-Node-Worker that are loaded via the meta endpoint from Function-Server. Use when adding new API integrations, understanding the API registration system, or modifying existing API connections.
version: 1.0
license: MIT
metadata:
  author: fsarch
  repository: function-node-worker
  related-files:
    - src/services/function-server/function-server.service.ts
    - src/services/function-executer/function-executer.service.ts
    - src/services/function-server/function-server.types.ts
---

## Overview

This skill provides comprehensive guidance for registering new APIs in the Function-Node-Worker system. APIs are dynamically loaded from the Function-Server via the `/v1/.meta/worker` endpoint and registered in the `FunctionExecuterService.createApi()` method.

### Architecture Flow

```
Function-Server (/v1/.meta/worker endpoint)
    ↓
WorkerMetaDto (contains api configurations)
    ↓
FunctionExecuterService.createApi() method
    ↓
API Classes (PdfServerApi, ProductServerApi, etc.)
    ↓
Available as fsarch object in VM context
```

### When to Use This Skill

- Adding a new API integration to Function-Node-Worker
- Understanding how existing APIs are registered
- Modifying API configuration types
- Creating new API client classes
- Debugging API registration issues

---

## Quick Start

### Register a New API in 3 Steps

**1. Add Type Definition** to `src/services/function-server/function-server.types.ts`:
```typescript
export type WorkerMetaMyServerConfigDto = {
  type: 'my-server';
  url: string;
  // Additional fields...
};

// Update the union
export type WorkerMetaApiConfigDto = 
  WorkerMetaPdfServerConfigDto |
  WorkerMetaMaterialTracingServerConfigDto |
  WorkerMetaProductServerConfigDto |
  WorkerMetaPrinterServerConfigDto |
  WorkerMetaMyServerConfigDto;
```

**2. Create API Class** at `src/services/function-executer/_utils/api/my-server/MyServer.api.ts`:
```typescript
import { TApiOptions } from "../api.type.js";
import { WorkerMetaMyServerConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export class MyServerApi {
  private readonly request;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaMyServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: this.apiOptions.config.url,
      getAccessToken: this.apiOptions.getAccessToken,
    });
  }

  async getResource(id: string) {
    return this.request({
      method: 'GET',
      path: `/resources/${id}`,
    });
  }
}
```

**3. Register API** in `src/services/function-executer/function-executer.service.ts`:
```typescript
// Add import
import { MyServerApi } from "./_utils/api/my-server/MyServer.api.js";

// In createApi() method:
function isMyServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaMyServerConfigDto> {
  return config.config.type === 'my-server';
}

if (isMyServerConfig(apiOptions)) {
  return [key, new MyServerApi(apiOptions)];
}
```

---

## Current API Types

The system currently supports these API types:

| Type | Configuration | Main Class | Description |
|------|---------------|------------|-------------|
| `pdf-server` | `url: string` | PdfServerApi | PDF generation and rendering |
| `material-tracing-server` | `url: string` | MaterialTracingServerApi | Material tracking and tracing |
| `product-server` | `url: string, catalogId: string` | ProductServerApi | Product catalog management |
| `printer-server` | `url: string` | PrinterServerApi | Printer and job management |

---

## Detailed API Registration Process

### Step 1: Define Configuration Type

Add your API type to `src/services/function-server/function-server.types.ts`:

```typescript
// Define your configuration type
export type WorkerMetaInventoryServerConfigDto = {
  type: 'inventory-server';  // Must match the type guard check
  url: string;               // Base URL for the API
  warehouseId: string;      // Custom configuration field
  defaultTimeout?: number;  // Optional field
};

// Update the WorkerMetaDto type
export type WorkerMetaDto = {
  api: {
    [key: string]: WorkerMetaApiConfigDto;
  };
};

// Extend the union type
export type WorkerMetaApiConfigDto = 
  WorkerMetaPdfServerConfigDto |
  WorkerMetaMaterialTracingServerConfigDto |
  WorkerMetaProductServerConfigDto |
  WorkerMetaPrinterServerConfigDto |
  WorkerMetaInventoryServerConfigDto;  // Add your new type
```

### Step 2: Create API Client Class

Create a new directory under `src/services/function-executer/_utils/api/{api-name}/`:

```typescript
// src/services/function-executer/_utils/api/inventory-server/InventoryServer.api.ts

import { TApiOptions } from "../api.type.js";
import { WorkerMetaInventoryServerConfigDto } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";
import { Logger } from '@nestjs/common';

export class InventoryServerApi {
  private readonly request;
  private readonly logger = new Logger(InventoryServerApi.name);

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaInventoryServerConfigDto>,
  ) {
    this.request = apiUtils.createRequest({
      url: this.apiOptions.config.url,
      getAccessToken: this.apiOptions.getAccessToken,
    });
  }

  /**
   * Get stock information for a specific item
   */
  async getStock(itemId: string) {
    this.logger.debug(`Fetching stock for item ${itemId}`);
    return this.request({
      method: 'GET',
      path: `/warehouses/${this.apiOptions.config.warehouseId}/items/${itemId}/stock`,
    });
  }

  /**
   * Reserve items in the warehouse
   */
  async reserveItem(itemId: string, quantity: number) {
    return this.request({
      method: 'POST',
      path: `/warehouses/${this.apiOptions.config.warehouseId}/reservations`,
      body: { itemId, quantity },
    });
  }

  /**
   * Search for items with optional filters
   */
  async searchItems(query: { name?: string; category?: string; minStock?: number }) {
    return this.request({
      method: 'GET',
      path: `/warehouses/${this.apiOptions.config.warehouseId}/items`,
      queryParams: query,
    });
  }
}
```

#### Best Practices for API Classes

1. **Use apiUtils.createRequest()** for consistent request handling with automatic token injection
2. **Add proper error handling** for non-2xx responses
3. **Include logging** using NestJS Logger for debugging
4. **Use TypeScript generics** for type safety
5. **Document methods** with JSDoc comments

### Step 3: Register API in FunctionExecuterService

Update `src/services/function-executer/function-executer.service.ts`:

```typescript
// Add import at the top with other API imports
import { InventoryServerApi } from "./_utils/api/inventory-server/InventoryServer.api.js";

// In the createApi() method, add type guard and instantiation
private async createApi(workerMeta: WorkerMetaDto): Promise<Record<string, unknown>> {
  const entries = (Object.entries(workerMeta.api) as unknown as Array<[string, WorkerMetaApiConfigDto]>).map(([key, value]) => {
    const apiOptions: TApiOptions = {
      getAccessToken: this.getAccessToken,
      config: value,
    }

    // Existing type guards...
    function isPdfServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaPdfServerConfigDto> {
      return config.config.type === 'pdf-server';
    }
    // ... other existing guards

    // NEW: Add your type guard
    function isInventoryServerConfig(config: TApiOptions): config is TApiOptions<WorkerMetaInventoryServerConfigDto> {
      return config.config.type === 'inventory-server';
    }

    // Existing conditions...
    if (isPdfServerConfig(apiOptions)) {
      return [key, new PdfServerApi(apiOptions)];
    }
    // ... other existing conditions

    // NEW: Add your condition
    if (isInventoryServerConfig(apiOptions)) {
      return [key, new InventoryServerApi(apiOptions)];
    }

    return [key, value];
  });

  return Object.fromEntries(entries);
}
```

---

## Advanced Topics

### Creating Nested API Classes

For complex APIs with multiple resource types, create nested API classes:

```typescript
// ProductItem.api.ts
export class ProductItemApi {
  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {}

  async getItem(id: string) {
    // Implementation
  }

  async createItem(data: any) {
    // Implementation
  }
}

// ProductAttribute.api.ts
export class ProductAttributeApi {
  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {}

  async getAttribute(id: string) {
    // Implementation
  }
}

// ProductServer.api.ts
export class ProductServerApi {
  public readonly items: ProductItemApi;
  public readonly attributes: ProductAttributeApi;

  constructor(
    private readonly apiOptions: TApiOptions<WorkerMetaProductServerConfigDto>,
  ) {
    this.items = new ProductItemApi(apiOptions);
    this.attributes = new ProductAttributeApi(apiOptions);
  }
}
```

### Using the API in Functions

Once registered, APIs are available in the VM context as `fsarch`:

```javascript
// In a user function
export async function run(itemId, quantity) {
  // Access the API through fsarch
  const stock = await fsarch.inventoryServer.getStock(itemId);
  
  if (stock.available >= quantity) {
    const reservation = await fsarch.inventoryServer.reserveItem(itemId, quantity);
    return { success: true, reservation };
  }
  
  return { success: false, message: 'Insufficient stock' };
}
```

---

## Automation Script

Use the provided script to automate API generation:

```bash
# Navigate to repository root
cd /Users/michael/IdeaProjects/github.com/fsarch/function-node-worker

# Run the generation script
node .agents/skills/register-function-api/scripts/generate-api.js \
  inventoryServer \
  --url string \
  --warehouseId string \
  --defaultTimeout number
```

### Script Usage

```
Usage: node generate-api.js <api-name> [options]

Arguments:
  <api-name>    API name in camelCase (e.g., 'inventoryServer', 'customerServer')

Options:
  --url <type>           URL field type (required, e.g., --url string)
  --<fieldName> <type>   Additional configuration fields
  --dry-run             Preview mode, no files created
  --help                Show this help

Examples:
  node generate-api.js inventoryServer --url string --warehouseId string
  node generate-api.js customerServer --url string --apiKey string --timeout number
  node generate-api.js paymentServer --url string --merchantId string --sandbox boolean --dry-run
```

---

## Templates

Pre-built templates are available in `assets/templates/`:

- **api-class.template.ts** - Basic API class structure
- **api-type.template.ts** - Type definition template
- **registration-snippet.template.ts** - Registration code template

---

## Troubleshooting

### Common Issues and Solutions

**1. TypeScript Error: Type not assignable to WorkerMetaApiConfigDto**

**Cause:** New type not added to the union type.

**Solution:**
```typescript
// In function-server.types.ts, ensure your type is in the union
export type WorkerMetaApiConfigDto = 
  WorkerMetaPdfServerConfigDto |
  WorkerMetaMaterialTracingServerConfigDto |
  WorkerMetaProductServerConfigDto |
  WorkerMetaPrinterServerConfigDto |
  WorkerMetaYourServerConfigDto;  // ← Check this is present
```

**2. TypeScript Error: Cannot find module**

**Cause:** Incorrect import path or file not created.

**Solution:**
- Verify the file exists at the specified path
- Check the import path is correct (use `.js` extension)
- Ensure the directory structure matches the import path

**3. Runtime Error: API not available in fsarch**

**Cause:** API not properly registered in createApi() method.

**Solution:**
- Check that the type guard is correctly implemented
- Verify the type name matches exactly (case-sensitive)
- Ensure the import is present in function-executer.service.ts

**4. TypeScript Error: config.type is not assignable**

**Cause:** Type field value doesn't match between definition and type guard.

**Solution:**
```typescript
// In type definition:
export type WorkerMetaXXXConfigDto = {
  type: 'xxx-server';  // ← Must match exactly
  ...
};

// In type guard:
function isXXXConfig(config: TApiOptions): config is TApiOptions<WorkerMetaXXXConfigDto> {
  return config.config.type === 'xxx-server';  // ← Must match exactly
}
```

---

## File References

| File | Purpose |
|------|---------|
| `src/services/function-server/function-server.service.ts` | Fetches WorkerMetaDto from Function-Server |
| `src/services/function-executer/function-executer.service.ts` | Registers and creates API instances |
| `src/services/function-server/function-server.types.ts` | Defines API configuration types |
| `src/services/function-executer/_utils/api/api.type.ts` | Defines TApiOptions type |
| `src/services/function-executer/_utils/api/api.utils.ts` | Utility functions for API requests |

---

## Key Code Locations

```
Function-Server Service
├── getWorkerMetadata() - Fetches metadata from /v1/.meta/worker
├── getAccessToken() - Handles authentication
└── getVersion() - Gets function version details

Function-Executer Service
├── createApi() - Main registration logic (line 73-116)
├── execute() - Executes functions with API context
└── getAccessToken() - Worker authentication

API Classes Directory
└── src/services/function-executer/_utils/api/
    ├── pdf-server/
    │   └── PdfServer.api.ts
    ├── material-tracing-server/
    │   ├── MaterialTracingServer.api.ts
    │   ├── MaterialTracingPart.api.ts
    │   └── MaterialTracingPartType.api.ts
    ├── product-server/
    │   ├── ProductServer.api.ts
    │   ├── ProductItem.api.ts
    │   ├── ProductAttribute.api.ts
    │   └── ProductAttributeElement.api.ts
    └── printer-server/
        ├── PrinterServer.api.ts
        ├── Printers.api.ts
        └── PrintersJobs.api.ts
```
