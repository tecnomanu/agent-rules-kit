#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

function parseFrontMatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      const header = content.slice(3, end).trim();
      const body = content.slice(end + 4).replace(/^\n+/, '');
      const meta = {};
      header.split(/\n/).forEach(line => {
        const [k, ...rest] = line.split(':');
        if (k && rest.length) {
          meta[k.trim()] = rest.join(':').trim();
        }
      });
      return { meta, body, frontMatter: `---\n${header}\n---\n` };
    }
  }
  return { meta: {}, body: content, frontMatter: '' };
}

async function writeFileIdempotent(filePath, content, backup=true) {
  if (await fs.pathExists(filePath)) {
    const existing = await fs.readFile(filePath, 'utf8');
    if (existing === content) {
      return; // no changes
    }
    if (backup) {
      const backupPath = `${filePath}.bak`;
      await fs.copy(filePath, backupPath);
    }
  }
  await fs.outputFile(filePath, content, 'utf8');
}

const TARGETS = {
  cursor: {
    name: 'Cursor',
    multiple: true,
    dir: '.cursor/rules',
    extension: '.mdc',
    keepFrontMatter: true
  },
  vscode: {
    name: 'VS Code / GitHub Copilot',
    multiple: false,
    file: '.github/copilot-instructions.md',
    extension: '.md',
    keepFrontMatter: false
  },
};

export async function runInstall(argv) {
  let target = null;
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--target=')) {
      target = arg.split('=')[1];
    } else if (arg === '--target' && i + 1 < argv.length) {
      target = argv[++i];
    } else if (arg.startsWith('--ide=')) {
      target = arg.split('=')[1];
    } else if (arg === '--ide' && i + 1 < argv.length) {
      target = argv[++i];
    } else if (arg.startsWith('--src=')) {
      args.src = arg.split('=')[1];
    } else if (arg === '--src' && i + 1 < argv.length) {
      args.src = argv[++i];
    } else if (arg === '--no-backup') {
      args.backup = false;
    }
  }

  const targetKey = target || (await inquirer.prompt([
    {
      type: 'list',
      name: 't',
      message: '¿En qué IDE/agent querés instalar las rules?',
      choices: Object.keys(TARGETS).map(k => ({ name: TARGETS[k].name, value: k }))
    }
  ])).t;

  if (!TARGETS[targetKey]) {
    console.error(`Unknown target: ${targetKey}`);
    process.exit(1);
  }

  const targetConfig = TARGETS[targetKey];
  const projectDir = process.cwd();
  const srcDir = path.resolve(projectDir, args.src || 'rules');
  const backup = args.backup !== false;

  const files = (await fs.pathExists(srcDir)) ? (await fs.readdir(srcDir)).filter(f => f.endsWith('.mdc')) : [];
  if (!files.length) {
    console.error('No source rules found');
    process.exit(1);
  }

  if (targetConfig.multiple) {
    const destDir = path.join(projectDir, targetConfig.dir);
    console.log(`Installing ${files.length} rules to ${destDir}`);
    for (const file of files.sort()) {
      const srcPath = path.join(srcDir, file);
      const content = await fs.readFile(srcPath, 'utf8');
      let outContent = content;
      if (!targetConfig.keepFrontMatter) {
        outContent = parseFrontMatter(content).body;
      }
      const destPath = path.join(destDir, file.replace(/\.mdc$/, targetConfig.extension));
      await writeFileIdempotent(destPath, outContent, backup);
    }
  } else {
    const destFile = path.join(projectDir, targetConfig.file);
    console.log(`Installing rules to ${destFile}`);
    const converted = [];
    for (const file of files.sort()) {
      const srcPath = path.join(srcDir, file);
      const content = await fs.readFile(srcPath, 'utf8');
      const { meta, body } = parseFrontMatter(content);
      const title = meta.description || file.replace(/\.mdc$/, '');
      converted.push({ title, body });
    }
    const index = converted.map((r, i) => `${i + 1}. ${r.title}`).join('\n');
    const sections = converted.map(r => `## ${r.title}\n\n${r.body}`).join('\n\n');
    const finalContent = `${index}\n\n${sections}\n`;
    await writeFileIdempotent(destFile, finalContent, backup);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runInstall(process.argv.slice(2));
}
