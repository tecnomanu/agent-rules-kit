import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { describe, it, expect } from 'vitest';

const execFileAsync = promisify(execFile);

const cliPath = path.resolve(__dirname, '../cli/index.js');
async function runInstall(args, cwd) {
  await execFileAsync('node', [cliPath, 'install', ...args], { cwd });
}

describe('install command', () => {
  it('copies rules for cursor preserving front matter', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ark-'));
    const rulesDir = path.join(tmp, 'rules');
    fs.ensureDirSync(rulesDir);
    const content = `---\ndescription: Alpha rule\n---\nAlpha content\n`;
    fs.writeFileSync(path.join(rulesDir, 'alpha.mdc'), content);

    await runInstall(['--ide=cursor', '--src=rules'], tmp);

    const out = await fs.readFile(path.join(tmp, '.cursor/rules/alpha.mdc'), 'utf8');
    expect(out).toBe(content);
  });

  it('creates copilot instructions without front matter', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ark-'));
    const rulesDir = path.join(tmp, 'rules');
    fs.ensureDirSync(rulesDir);
    fs.writeFileSync(path.join(rulesDir, 'alpha.mdc'), `---\ndescription: Alpha rule\n---\nAlpha content\n`);
    fs.writeFileSync(path.join(rulesDir, 'beta.mdc'), `---\ndescription: Beta rule\n---\nBeta content\n`);

    await runInstall(['--target=vscode', '--src=rules'], tmp);

    const out = await fs.readFile(path.join(tmp, '.github/copilot-instructions.md'), 'utf8');
    expect(out).toContain('1. Alpha rule');
    expect(out).toContain('2. Beta rule');
    expect(out).toContain('## Alpha rule');
    expect(out).not.toContain('description:');
  });
});
