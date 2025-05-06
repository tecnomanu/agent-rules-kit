#!/usr/bin/env node
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

const stacks = ['laravel', 'nextjs', 'nestjs', 'react', 'angular', 'astro', 'generic'];

const addFrontMatter = (body, meta) =>
    `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}`;


const wrapMdToMdc = (src, destDir) => {
    const md = fs.readFileSync(src, 'utf8');
    fs.outputFileSync(destFile, addFrontMatter(md, meta));
};

const copyRuleGroup = (tmplDir, destDir, meta) =>
    fs.readdirSync(tmplDir).forEach(f =>
        wrapMdToMdc(path.join(tmplDir, f),
            path.join(destDir, f.replace(/\\.md$/, '.mdc')),
            meta)
    );

const detectLaravelVersion = () => {
    try {
        const composer = JSON.parse(fs.readFileSync('composer.json', 'utf8'));
        const v = composer.require['laravel/framework'] || '';
        return v.match(/\\d+/) ? parseInt(v.match(/\\d+/)[0], 10) : null;
    } catch { return null; }
};

const copyOverlay = (stack, version, targetRules) => {
    const overlayDir = path.join(templatesDir, 'stacks', stack, `v${version}`);
    if (fs.existsSync(overlayDir)) {
        fs.readdirSync(overlayDir).forEach(f =>
            wrapMdToMdc(path.join(overlayDir, f), path.join(targetRules, stack))
        );
        console.log(`→ Applied ${stack} v${version} overlay`);
    }
};

const copyStack = (stack, targetRules) => {
    const baseDir = path.join(templatesDir, 'stacks', stack, 'base');
    fs.readdirSync(baseDir).forEach(f => {
        wrapMdToMdc(path.join(baseDir, f), path.join(targetRules, stack));
    });

    if (stack === 'laravel') {
        const ver = detectLaravelVersion();
        if (ver) copyOverlay('laravel', ver, targetRules);
    }
    // TODO nextjs detection ...
};

const main = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selected',
            message: 'Select stack(s):',
            choices: stacks
        },
        {
            type: 'confirm',
            name: 'global',
            message: 'Include global best‑practice rules?',
            default: true
        },
        {
            type: 'input',
            name: 'root',
            message: 'Relative path where .cursor/rules vivirá',
            default: '.'
        },
        {
            type: 'confirm',
            name: 'mirrorDocs',
            message: 'Generate mirror docs in docs/ ?',
            default: false
        }
    ]);

    const targetRules = path.join(process.cwd(), answers.root, '.cursor', 'rules');
    const targetDocs = path.join(process.cwd(), 'docs');

    if (answers.global) {
        fs.readdirSync(path.join(templatesDir, 'global')).forEach(f =>
            wrapMdToMdc(path.join(templatesDir, 'global', f), path.join(targetRules, 'global'))
        );
    }

    for (const s of answers.selected) copyStack(s, targetRules);

    if (answers.mirrorDocs) {
        fs.copySync(path.join(templatesDir, 'global'), path.join(targetDocs, 'global'));
        answers.selected.forEach(s =>
            fs.copySync(
                path.join(templatesDir, 'stacks', s, 'base'),
                path.join(targetDocs, s)
            )
        );
    }

    console.log('✅  Reglas copiadas.');
};

main();