import { describe, it, expect, afterEach } from 'vitest';
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../../dist/cli.js');

// Check if openspec is installed
function isOpenSpecInstalled(): boolean {
  try {
    execSync('openspec --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const openspecAvailable = isOpenSpecInstalled();

const describeIf = openspecAvailable ? describe : describe.skip;

describeIf('flow init (e2e)', () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('creates all expected files on first run', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-engine-e2e-'));

    const result = spawnSync('node', [CLI_PATH, 'init'], {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    if (result.status !== 0) {
      throw new Error(
        `flow init failed with status ${result.status}.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
      );
    }

    // schema.yaml exists and contains expected content
    const schemaPath = path.join(tmpDir, 'openspec', 'schemas', 'flow-engine', 'schema.yaml');
    expect(fs.existsSync(schemaPath), `schema.yaml should exist at ${schemaPath}`).toBe(true);

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    expect(schemaContent).toContain('name: flow-engine');

    // All 4 automation artifact IDs
    expect(schemaContent).toContain('id: implement');
    expect(schemaContent).toContain('id: test');
    expect(schemaContent).toContain('id: verify');
    expect(schemaContent).toContain('id: review');

    // All 4 automation templates exist
    const templatesDir = path.join(tmpDir, 'openspec', 'schemas', 'flow-engine', 'templates');
    for (const template of ['implement.md', 'test.md', 'verify.md', 'review.md']) {
      const templatePath = path.join(templatesDir, template);
      expect(fs.existsSync(templatePath), `automation template ${template} should exist`).toBe(true);
    }

    // Standard templates exist (forked from spec-driven)
    for (const template of ['proposal.md', 'tasks.md']) {
      const templatePath = path.join(templatesDir, template);
      expect(fs.existsSync(templatePath), `standard template ${template} should exist`).toBe(true);
    }

    // config.yaml contains schema: flow-engine
    const configPath = path.join(tmpDir, 'openspec', 'config.yaml');
    expect(fs.existsSync(configPath), `config.yaml should exist at ${configPath}`).toBe(true);
    const configContent = fs.readFileSync(configPath, 'utf-8');
    expect(configContent).toContain('schema: flow-engine');
  });

  it('is idempotent — running init twice does not error', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-engine-e2e-'));

    // First run
    const first = spawnSync('node', [CLI_PATH, 'init'], {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    expect(
      first.status,
      `first run failed:\nstdout: ${first.stdout}\nstderr: ${first.stderr}`
    ).toBe(0);

    // Second run
    const second = spawnSync('node', [CLI_PATH, 'init'], {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    expect(
      second.status,
      `second run failed:\nstdout: ${second.stdout}\nstderr: ${second.stderr}`
    ).toBe(0);
  });
});
