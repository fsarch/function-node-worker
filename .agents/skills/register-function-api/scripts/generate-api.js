#!/usr/bin/env node

/**
 * Automated script for generating a new API for Function-Node-Worker
 * 
 * Usage:
 *   node .agents/skills/register-function-api/scripts/generate-api.js <api-name> [options]
 * 
 * Examples:
 *   node .agents/skills/register-function-api/scripts/generate-api.js inventoryServer --url string --warehouseId string
 *   node .agents/skills/register-function-api/scripts/generate-api.js customerServer --url string --apiKey string
 * 
 * Options:
 *   --url <type>          URL field (required)
 *   --<fieldName> <type>  Additional configuration fields
 *   --dry-run             Preview mode, no files created
 *   --help                Show this help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, '../../../..');

// Argument Parsing
const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Usage: node .agents/skills/register-function-api/scripts/generate-api.js <api-name> [options]

Arguments:
  <api-name>    API name in camelCase (e.g., 'inventoryServer', 'customerServer')

Options:
  --url <type>           URL field type (required, e.g., --url string)
  --<fieldName> <type>   Additional configuration fields
  --dry-run             Preview mode, no files created
  --help                Show this help

Examples:
  node .agents/skills/register-function-api/scripts/generate-api.js inventoryServer --url string --warehouseId string
  node .agents/skills/register-function-api/scripts/generate-api.js customerServer --url string --apiKey string --timeout number
  node .agents/skills/register-function-api/scripts/generate-api.js paymentServer --url string --merchantId string --sandbox boolean --dry-run

Notes:
  - The API name is used for class and file names
  - The type name is generated as 'WorkerMeta<ApiName>ConfigDto'
  - The type field value is generated as kebab-case (e.g., 'inventory-server')
  - All fields except 'url' are marked as optional
`);
}

function parseArgs(args) {
  const options = {};
  let apiName;
  let dryRun = false;
  let showHelpFlag = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelpFlag = true;
      continue;
    }
    
    if (arg === '--dry-run' || arg === '-d') {
      dryRun = true;
      continue;
    }
    
    if (arg.startsWith('--')) {
      const fieldName = arg.slice(2);
      const fieldType = args[++i];
      if (!fieldType) {
        console.error(`Error: Missing type for option --${fieldName}`);
        process.exit(1);
      }
      options[fieldName] = fieldType;
    } else if (!apiName) {
      apiName = arg;
    } else {
      console.error(`Error: Unexpected argument '${arg}'`);
      process.exit(1);
    }
  }

  if (showHelpFlag) {
    showHelp();
    process.exit(0);
  }

  if (!apiName) {
    console.error('Error: Missing api-name argument');
    showHelp();
    process.exit(1);
  }

  if (!options.url) {
    console.error('Error: --url option is required');
    showHelp();
    process.exit(1);
  }

  return { apiName, options, dryRun };
}

function toPascalCase(str) {
  return str.replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\s\w/g, c => c.toUpperCase())
    .replace(/\s+/g, '');
}

function toKebabCase(str) {
  return str.replace(/([A-Z])/g, (m, p1, offset) => 
    offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()
  );
}

function generateTypeDefinition(apiName, options) {
  const pascalName = toPascalCase(apiName);
  const kebabName = toKebabCase(apiName);
  const typeName = `WorkerMeta${pascalName}ConfigDto`;

  const fields = Object.entries(options).map(([fieldName, fieldType]) => {
    const isOptional = !['url'].includes(fieldName);
    return `  ${fieldName}${isOptional ? '?' : ''}: ${fieldType};`;
  }).join('\n');

  return `export type ${typeName} = {
  type: '${kebabName}';
${fields}
};

// TODO: Add this type to the WorkerMetaApiConfigDto union
export type WorkerMetaApiConfigDto = 
  WorkerMetaPdfServerConfigDto |
  WorkerMetaMaterialTracingServerConfigDto |
  WorkerMetaProductServerConfigDto |
  WorkerMetaPrinterServerConfigDto |
  ${typeName}; // <-- Add this new line
`;
}

function generateApiClass(apiName, options) {
  const pascalName = toPascalCase(apiName);
  const kebabName = toKebabCase(apiName);
  const typeName = `WorkerMeta${pascalName}ConfigDto`;

  return `import { TApiOptions } from "../api.type.js";
import { ${typeName} } from "../../../../function-server/function-server.types.js";
import { apiUtils } from "../api.utils.js";

export class ${pascalName}Api {
  private readonly request;

  constructor(
    private readonly apiOptions: TApiOptions<${typeName}>,
  ) {
    this.request = apiUtils.createRequest({
      url: this.apiOptions.config.url,
      getAccessToken: this.apiOptions.getAccessToken,
    });
  }

  // TODO: Add your methods here
  // Example:
  // async getResource(id: string) {
  //   return this.request({
  //     method: 'GET',
  //     path: \`/resources/\${id}\`,
  //   });
  // }
}
`;
}

function generateRegistrationSnippet(apiName) {
  const pascalName = toPascalCase(apiName);
  const kebabName = toKebabCase(apiName);
  const typeName = `WorkerMeta${pascalName}ConfigDto`;

  return `// Add this import
import { ${pascalName}Api } from "./_utils/api/${kebabName}/${pascalName}.api.js";

// Insert this code in the createApi() method (before the return statement)
function is${pascalName}Config(config: TApiOptions): config is TApiOptions<${typeName}> {
  return config.config.type === '${kebabName}';
}

if (is${pascalName}Config(apiOptions)) {
  return [key, new ${pascalName}Api(apiOptions)];
}
`;
}

function getFilePaths(apiName) {
  const kebabName = toKebabCase(apiName);
  const pascalName = toPascalCase(apiName);
  
  return {
    apiClassPath: path.join(repositoryRoot, 'src/services/function-executer/_utils/api', kebabName, `${pascalName}.api.ts`),
    typeDefinitionPath: path.join(repositoryRoot, 'src/services/function-server/function-server.types.ts'),
    registrationPath: path.join(repositoryRoot, 'src/services/function-executer/function-executer.service.ts'),
  };
}

function generateSummary(apiName, options, dryRun) {
  const pascalName = toPascalCase(apiName);
  const kebabName = toKebabCase(apiName);
  const typeName = `WorkerMeta${pascalName}ConfigDto`;
  
  const { apiClassPath, typeDefinitionPath, registrationPath } = getFilePaths(apiName);
  
  const relativeApiPath = path.relative(repositoryRoot, apiClassPath);
  const relativeTypePath = path.relative(repositoryRoot, typeDefinitionPath);
  const relativeRegistrationPath = path.relative(repositoryRoot, registrationPath);

  console.log('\n' + '='.repeat(70));
  console.log('API GENERATION SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`\n📦 API Name: ${apiName}`);
  console.log(`   Type Name: ${typeName}`);
  console.log(`   Type Field: '${kebabName}'`);
  console.log(`   Class Name: ${pascalName}Api`);

  console.log('\n📁 Files to Create/Modify:');
  console.log(`\n1. 📄 API Class File`);
  console.log(`   Path: ${relativeApiPath}`);
  console.log(`   Status: ${dryRun ? '⏸️  NOT CREATED (dry-run mode)' : '✅ CREATED'}`);

  console.log(`\n2. ✏️  Type Definition`);
  console.log(`   File: ${relativeTypePath}`);
  console.log(`   Action: Add ${typeName} and update WorkerMetaApiConfigDto union`);
  console.log(`   Status: ${dryRun ? '⏸️  MANUAL ACTION REQUIRED' : '📝 MARKED FOR ADDITION'}`);

  console.log(`\n3. ✏️  Registration`);
  console.log(`   File: ${relativeRegistrationPath}`);
  console.log(`   Action: Add import and type guard + instantiation in createApi()`);
  console.log(`   Status: ${dryRun ? '⏸️  MANUAL ACTION REQUIRED' : '📝 MARKED FOR ADDITION'}`);

  console.log('\n' + '='.repeat(70));
  console.log('CONFIGURATION');
  console.log('='.repeat(70));
  console.log('\nFields:');
  Object.entries(options).forEach(([fieldName, fieldType]) => {
    const isRequired = ['url'].includes(fieldName);
    console.log(`  ${isRequired ? '⭐' : '⭕'} ${fieldName}: ${fieldType}${isRequired ? ' (required)' : ''}`);
  });

  console.log('\n' + '='.repeat(70));
  
  if (dryRun) {
    console.log('🔍 DRY-RUN MODE: No files were modified.');
    console.log('   Run without --dry-run to create files.');
  } else {
    console.log('✅ Generation complete!');
    console.log('   Follow the instructions to complete manual steps.');
  }
  
  console.log('='.repeat(70) + '\n');
}

function getRelativePath(from, to) {
  return path.relative(from, to);
}

async function main() {
  try {
    // Parse arguments
    const { apiName, options, dryRun } = parseArgs(args);

    // Generated content
    const typeDefinition = generateTypeDefinition(apiName, options);
    const apiClass = generateApiClass(apiName, options);
    const registrationSnippet = generateRegistrationSnippet(apiName);

    // File paths
    const { apiClassPath, typeDefinitionPath, registrationPath } = getFilePaths(apiName);

    // Create directory if it doesn't exist
    const apiDir = path.dirname(apiClassPath);
    if (!dryRun) {
      try {
        await fs.promises.mkdir(apiDir, { recursive: true });
        console.log(`📁 Directory created: ${path.relative(repositoryRoot, apiDir)}`);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }

      // Write API class file
      await fs.promises.writeFile(apiClassPath, apiClass, 'utf8');
      console.log(`✅ API class created: ${path.relative(repositoryRoot, apiClassPath)}`);

      // Generate summary
      generateSummary(apiName, options, dryRun);

      // Show generated content
      console.log('\n📄 GENERATED CONTENT:\n');
      console.log('─'.repeat(70));
      console.log('Type Definition (add to src/services/function-server/function-server.types.ts):');
      console.log('─'.repeat(70));
      console.log(typeDefinition);
      console.log('\n' + '─'.repeat(70));
      console.log('Registration (add to src/services/function-executer/function-executer.service.ts):');
      console.log('─'.repeat(70));
      console.log(registrationSnippet);
      console.log('─'.repeat(70) + '\n');
    } else {
      // Dry-run: only show summary
      generateSummary(apiName, options, dryRun);

      console.log('\n📄 PREVIEW OF GENERATED CONTENT:\n');
      console.log('─'.repeat(70));
      console.log('Type Definition:');
      console.log('─'.repeat(70));
      console.log(typeDefinition);
      console.log('\n' + '─'.repeat(70));
      console.log('API Class:');
      console.log('─'.repeat(70));
      console.log(apiClass);
      console.log('\n' + '─'.repeat(70));
      console.log('Registration:');
      console.log('─'.repeat(70));
      console.log(registrationSnippet);
      console.log('─'.repeat(70) + '\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    showHelp();
    process.exit(1);
  }
}

main();
