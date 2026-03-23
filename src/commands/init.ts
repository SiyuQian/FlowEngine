import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOpenSpec } from '../utils/openspec.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BUNDLED_SCHEMA_PATH = path.resolve(__dirname, '../schema/schema.yaml');
export const BUNDLED_TEMPLATES_PATH = path.resolve(__dirname, '../schema/templates');

export function getSchemaDir(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', 'schemas', 'flow-engine');
}

export function getTemplatesDir(projectRoot: string): string {
  return path.join(getSchemaDir(projectRoot), 'templates');
}

const AUTOMATION_TEMPLATES = ['implement.md', 'test.md', 'verify.md', 'review.md'];

export async function initCommand(projectRoot: string): Promise<void> {
  // 1. Initialize openspec if needed
  const openspecDir = path.join(projectRoot, 'openspec');
  if (!fs.existsSync(openspecDir)) {
    console.log('Initializing OpenSpec...');
    runOpenSpec(['init', '--tools', 'none', projectRoot]);
    console.log('✓ openspec initialized');
  }

  // 3. Fork spec-driven schema (for standard templates)
  const schemaDir = getSchemaDir(projectRoot);
  if (!fs.existsSync(schemaDir)) {
    console.log('Forking spec-driven schema...');
    runOpenSpec(['schema', 'fork', 'spec-driven', 'flow-engine'], projectRoot);
    console.log('✓ spec-driven schema forked');
  }

  // 4. Overwrite schema.yaml with flow-engine schema
  const schemaYamlDest = path.join(schemaDir, 'schema.yaml');
  fs.copyFileSync(BUNDLED_SCHEMA_PATH, schemaYamlDest);
  console.log('✓ flow-engine schema.yaml installed');

  // 5. Copy automation templates
  const templatesDir = getTemplatesDir(projectRoot);
  for (const template of AUTOMATION_TEMPLATES) {
    const src = path.join(BUNDLED_TEMPLATES_PATH, template);
    const dest = path.join(templatesDir, template);
    fs.copyFileSync(src, dest);
  }
  console.log('✓ automation templates installed');

  // 6. Update config.yaml
  const configPath = path.join(openspecDir, 'config.yaml');
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, 'utf-8');
    if (config.includes('schema:') && !config.includes('schema: flow-engine')) {
      const currentSchema = config.match(/schema:\s*(\S+)/)?.[1];
      console.warn(`Warning: config.yaml already uses schema "${currentSchema}".`);
      console.warn('Updating to flow-engine.');
    }
    config = config.replace(/schema:\s*\S+/, 'schema: flow-engine');
    if (!config.includes('schema:')) {
      config += '\nschema: flow-engine\n';
    }
    fs.writeFileSync(configPath, config);
  } else {
    fs.writeFileSync(configPath, 'schema: flow-engine\n');
  }
  console.log('✓ config.yaml updated (schema: flow-engine)');

  console.log("\nflow-engine initialized. Use '/opsx:propose <name>' in your IDE to start.");
}
