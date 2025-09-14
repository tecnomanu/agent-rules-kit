import { execFile } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const cliPath = path.resolve(__dirname, '../cli/index.js');

async function runCli(args, cwd) {
  const { stdout, stderr } = await execFileAsync('node', [cliPath, ...args], {
    cwd,
    timeout: 30000 // 30 second timeout
  });
  return { stdout, stderr };
}

describe('IDE Integration Tests', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-rules-kit-test-'));
    // Create a fake Laravel project
    fs.writeJsonSync(path.join(tempDir, 'composer.json'), {
      require: {
        'laravel/framework': '^12.0'
      }
    });
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.removeSync(tempDir);
    }
  });

  it('generates rules for Cursor IDE', async () => {
    await runCli([
      '--stack=laravel',
      '--version=12',
      '--architecture=standard',
      '--global',
      '--ide=cursor',
      '--auto-install'
    ], tempDir);

    // Check that Cursor rules directory was created
    const cursorRulesDir = path.join(tempDir, '.cursor/rules/rules-kit');
    expect(fs.existsSync(cursorRulesDir)).toBe(true);

    // Check for global rules
    const globalDir = path.join(cursorRulesDir, 'global');
    expect(fs.existsSync(globalDir)).toBe(true);

    // Check for Laravel rules
    const laravelDir = path.join(cursorRulesDir, 'laravel');
    expect(fs.existsSync(laravelDir)).toBe(true);

    // Check that files have .mdc extension and front matter
    const laravelFiles = fs.readdirSync(laravelDir);
    expect(laravelFiles.length).toBeGreaterThan(0);

    const sampleFile = path.join(laravelDir, laravelFiles[0]);
    const content = fs.readFileSync(sampleFile, 'utf8');
    expect(content).toMatch(/^---\n/); // Should start with front matter
  });

  it('generates consolidated rules for VS Code', async () => {
    await runCli([
      '--stack=laravel',
      '--version=12',
      '--global',
      '--ide=vscode',
      '--auto-install'
    ], tempDir);

    // Check that VS Code instructions file was created
    const vscodeFile = path.join(tempDir, '.github/copilot-instructions.md');
    expect(fs.existsSync(vscodeFile)).toBe(true);

    // Check content format
    const content = fs.readFileSync(vscodeFile, 'utf8');
    expect(content).toContain('# Agent Rules'); // Should have title
    expect(content).toMatch(/^\d+\./m); // Should have numbered index
    expect(content).toContain('##'); // Should have sections
    expect(content).not.toMatch(/^---\n/); // Should not have front matter
  });

  it('generates rules for Claude IDE', async () => {
    await runCli([
      '--stack=laravel',
      '--version=12',
      '--global',
      '--ide=claude',
      '--auto-install'
    ], tempDir);

    // Check that Claude file was created
    const claudeFile = path.join(tempDir, 'CLAUDE.md');
    expect(fs.existsSync(claudeFile)).toBe(true);

    // Check content format
    const content = fs.readFileSync(claudeFile, 'utf8');
    expect(content).toContain('# Agent Rules');
    expect(content).toMatch(/^\d+\./m); // Should have numbered index
  });

  it('creates backup when file already exists', async () => {
    // Create existing file
    const claudeFile = path.join(tempDir, 'CLAUDE.md');
    fs.writeFileSync(claudeFile, 'Existing content');

    await runCli([
      '--stack=laravel',
      '--version=12',
      '--ide=claude',
      '--auto-install'
    ], tempDir);

    // Check that backup was created
    const backupFiles = fs.readdirSync(tempDir).filter(f => f.startsWith('CLAUDE.md.backup-'));
    expect(backupFiles.length).toBe(1);

    // Check that original content was preserved in backup
    const backupContent = fs.readFileSync(path.join(tempDir, backupFiles[0]), 'utf8');
    expect(backupContent).toBe('Existing content');
  });

  it('detects Laravel version automatically', async () => {
    const { stdout } = await runCli([
      '--stack=laravel',
      '--architecture=standard',
      '--global',
      '--ide=cursor',
      '--auto-install'
    ], tempDir);

    expect(stdout).toContain('Detected laravel version: 12');
  });

  it('handles different architectures', async () => {
    await runCli([
      '--stack=laravel',
      '--version=12',
      '--architecture=ddd',
      '--global',
      '--ide=cursor',
      '--auto-install'
    ], tempDir);

    const cursorRulesDir = path.join(tempDir, '.cursor/rules/rules-kit');
    expect(fs.existsSync(cursorRulesDir)).toBe(true);

    // Should have architecture-specific files
    const laravelDir = path.join(cursorRulesDir, 'laravel');
    const files = fs.readdirSync(laravelDir);
    const architectureFile = files.find(f => f.includes('architecture') || f.includes('ddd'));
    expect(architectureFile).toBeDefined();
  });

  it('includes MCP tools when specified', async () => {
    await runCli([
      '--stack=laravel',
      '--version=12',
      '--global',
      '--mcp-tools=pampa',
      '--ide=cursor',
      '--auto-install'
    ], tempDir);

    const mcpDir = path.join(tempDir, '.cursor/rules/rules-kit/mcp-tools');
    expect(fs.existsSync(mcpDir)).toBe(true);

    const mcpFiles = fs.readdirSync(mcpDir, { recursive: true });
    const pampaFile = mcpFiles.find(f => f.includes('pampa'));
    expect(pampaFile).toBeDefined();
  });
});
