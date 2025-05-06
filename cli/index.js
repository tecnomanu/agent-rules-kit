#!/usr/bin/env node
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { LARAVEL_ARCHITECTURES, NEXTJS_ROUTER_MODES, STACKS, getAvailableArchitectures, loadKitConfig } from './utils/config.js';
import { copyRuleGroup, wrapMdToMdc } from './utils/file-helpers.js';
import { copyArchitectureRules } from './utils/nextjs-helpers.js';
import { copyStack } from './utils/stack-helpers.js';
import * as versionDetector from './version-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

console.log(`Available stacks: ${STACKS.join(', ')}`);

/**
 * Display information about the detected version and allow manual override
 * @param {string} stack - Selected stack
 * @param {string} projectPath - Path to the project
 * @returns {Promise<number|null>} - Selected version
 */
const handleVersionSelection = async (stack, projectPath) => {
    const detectedVersion = versionDetector.detectVersion(stack, projectPath);

    if (detectedVersion) {
        const versionRange = versionDetector.mapVersionToRange(stack, detectedVersion, templatesDir);
        console.log(`\nDetected ${stack} version: ${detectedVersion} (compatibility: ${versionRange})`);

        const confirm = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'useDetected',
                message: `Use detected version ${detectedVersion}?`,
                default: true
            }
        ]);

        if (confirm.useDetected) {
            return detectedVersion;
        }
    } else {
        console.log(`\nCould not automatically detect ${stack} version.`);
    }

    // Get available versions from kit-config.json
    const config = loadKitConfig(templatesDir);
    const versionRanges = config.version_ranges?.[stack] || {};
    const availableVersions = Object.keys(versionRanges).map(Number).sort((a, b) => b - a);

    if (availableVersions.length === 0) {
        console.log(`No versions configured for ${stack}.`);
        return null;
    }

    // Ask user to select version
    const versionAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'version',
            message: 'Select version:',
            choices: availableVersions.map(v => ({
                name: `${v} (${versionRanges[v] || 'not configured'})`,
                value: v
            })),
            default: availableVersions[0]
        }
    ]);

    return versionAnswer.version;
};

const main = async () => {
    console.log('🛠️  Agent Rules Kit - Installation');
    console.log('Note: If you need to install multiple stacks, run this tool once for each stack.');

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selected',
            message: 'Select a stack to install:',
            choices: STACKS,
            default: 'laravel'
        },
        {
            type: 'confirm',
            name: 'global',
            message: 'Include global best-practice rules?',
            default: true
        },
        {
            type: 'input',
            name: 'root',
            message: 'Where is the .cursor directory located:',
            default: '.'
        },
        {
            type: 'input',
            name: 'projectPath',
            message: 'Relative path to your project (if not in the root):',
            default: '.'
        },
        {
            type: 'confirm',
            name: 'mirrorDocs',
            message: 'Generate mirror docs in docs/ directory?',
            default: false
        }
    ]);

    // Handle version selection
    const selectedVersion = await handleVersionSelection(answers.selected, answers.projectPath);

    // Load config to get default architectures
    const config = loadKitConfig(templatesDir);

    // Ask for framework-specific options
    let architecture = null;

    // Ask for Laravel architecture options
    if (answers.selected === 'laravel') {
        // Get available architectures
        const availableArchitectures = getAvailableArchitectures('laravel', templatesDir);

        // Use predefined options if no architectures found
        const architectureChoices = availableArchitectures.length > 0
            ? availableArchitectures
            : LARAVEL_ARCHITECTURES;

        // Set default architecture from config or use 'standard'
        const defaultArchitecture = config.laravel?.default_architecture || 'standard';

        console.log(`\nLaravel selected, asking for architecture...`);
        const archAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: 'Select Laravel architecture style:',
                choices: architectureChoices,
                default: defaultArchitecture
            }
        ]);
        architecture = archAnswer.architecture;
        console.log(`Selected Laravel architecture: ${architecture}`);
    }

    // Ask for Next.js architecture (previously router mode)
    if (answers.selected === 'nextjs') {
        // Set default architecture from config or use 'app'
        const defaultArchitecture = config.nextjs?.default_architecture || 'app';

        const routerAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: 'Select Next.js architecture:',
                choices: NEXTJS_ROUTER_MODES,
                default: defaultArchitecture
            }
        ]);
        architecture = routerAnswer.architecture;
    }

    // Use rules-kit subfolder instead of putting everything in rules/
    const targetRules = path.join(process.cwd(), answers.root, '.cursor', 'rules', 'rules-kit');
    const targetDocs = path.join(process.cwd(), 'docs');

    // Ensure the rules directory exists
    fs.ensureDirSync(targetRules);

    // Copy global rules
    if (answers.global) {
        const globalDir = path.join(templatesDir, 'global');
        // Apply global rules directly to the global subfolder
        const globalFolder = path.join(targetRules, 'global');
        fs.ensureDirSync(globalFolder);

        if (fs.existsSync(globalDir)) {
            fs.readdirSync(globalDir).forEach(f => {
                const srcFile = path.join(globalDir, f);
                const destFile = path.join(globalFolder, `${f}`.replace(/\.md$/, '.mdc'));
                const meta = {
                    projectPath: answers.projectPath !== '.' ? answers.projectPath : '',
                };
                wrapMdToMdc(srcFile, destFile, meta);
            });
            console.log(`→ Applied global rules`);
        }
    }

    // Copy selected stack rules
    await copyStack(
        templatesDir,
        answers.selected,
        targetRules,
        answers.projectPath,
        {
            architecture,
            selectedVersion
        }
    );

    // Apply Next.js specific architecture rules if needed
    if (answers.selected === 'nextjs' && architecture) {
        console.log(`Applying Next.js architecture rules for ${architecture}`);
        copyArchitectureRules(templatesDir, architecture, targetRules);
    }

    // Generate mirror documentation
    if (answers.mirrorDocs) {
        fs.ensureDirSync(targetDocs);
        const globalDocsDir = path.join(targetDocs, 'global');
        fs.ensureDirSync(globalDocsDir);

        // Copy global docs
        if (answers.global) {
            const globalDir = path.join(templatesDir, 'global');
            if (fs.existsSync(globalDir)) {
                copyRuleGroup(globalDir, globalDocsDir);
                console.log(`→ Global documentation copied to ${globalDocsDir}`);
            }
        }

        // Copy stack docs
        const stackDocsDir = path.join(targetDocs, answers.selected);
        fs.ensureDirSync(stackDocsDir);

        // Copy base docs
        const baseDir = path.join(templatesDir, 'stacks', answers.selected, 'base');
        if (fs.existsSync(baseDir)) {
            copyRuleGroup(baseDir, stackDocsDir);
            console.log(`→ Base ${answers.selected} documentation copied to ${stackDocsDir}`);
        }

        // Copy version-specific docs
        const versionDir = versionDetector.getVersionDirectory(templatesDir, answers.selected, answers.projectPath);
        if (versionDir) {
            const versionDocsDir = path.join(stackDocsDir, versionDir);
            fs.ensureDirSync(versionDocsDir);
            const versionSrcDir = path.join(templatesDir, 'stacks', answers.selected, versionDir);
            if (fs.existsSync(versionSrcDir)) {
                copyRuleGroup(versionSrcDir, versionDocsDir);
                console.log(`→ ${answers.selected} ${versionDir} documentation copied to ${versionDocsDir}`);
            }
        }

        // Copy architecture docs for Laravel
        if (answers.selected === 'laravel' && architecture) {
            // Check new directory structure first
            const newArchDocsDir = path.join(stackDocsDir, 'architectures', architecture);
            fs.ensureDirSync(newArchDocsDir);
            const newArchSrcDir = path.join(templatesDir, 'stacks', 'laravel', 'architectures', architecture);

            // Fallback to old directory structure
            const oldArchDocsDir = path.join(stackDocsDir, 'architectures', architecture);
            fs.ensureDirSync(oldArchDocsDir);
            const oldArchSrcDir = path.join(templatesDir, 'architectures', 'laravel', architecture);

            if (fs.existsSync(newArchSrcDir)) {
                copyRuleGroup(newArchSrcDir, newArchDocsDir);
                console.log(`→ ${architecture} architecture documentation copied to ${newArchDocsDir}`);
            } else if (fs.existsSync(oldArchSrcDir)) {
                copyRuleGroup(oldArchSrcDir, oldArchDocsDir);
                console.log(`→ ${architecture} architecture documentation copied to ${oldArchDocsDir}`);
            }
        }

        // Copy architecture docs for Next.js
        if (answers.selected === 'nextjs' && architecture) {
            const archDocsDir = path.join(stackDocsDir, 'architectures', architecture);
            fs.ensureDirSync(archDocsDir);

            // For hybrid, we need to copy both app and pages
            if (architecture === 'hybrid') {
                ['app', 'pages'].forEach(archType => {
                    const archSrcDir = path.join(templatesDir, 'stacks', 'nextjs', 'architectures', archType);
                    const typeDocsDir = path.join(archDocsDir, archType);
                    fs.ensureDirSync(typeDocsDir);

                    if (fs.existsSync(archSrcDir)) {
                        copyRuleGroup(archSrcDir, typeDocsDir);
                        console.log(`→ Next.js ${archType} architecture documentation copied to ${typeDocsDir}`);
                    }
                });
            } else {
                const archSrcDir = path.join(templatesDir, 'stacks', 'nextjs', 'architectures', architecture);
                if (fs.existsSync(archSrcDir)) {
                    copyRuleGroup(archSrcDir, archDocsDir);
                    console.log(`→ Next.js ${architecture} architecture documentation copied to ${archDocsDir}`);
                }
            }
        }
    }

    // Report architecture for Laravel
    if (answers.selected === 'laravel' && architecture) {
        const archName = LARAVEL_ARCHITECTURES.find(a => a.value === architecture)?.name || architecture;
        console.log(`→ Using ${archName} for Laravel`);
    }

    // Report architecture for Next.js
    if (answers.selected === 'nextjs' && architecture) {
        const architectureName = NEXTJS_ROUTER_MODES.find(r => r.value === architecture)?.name || architecture;
        console.log(`→ Using ${architectureName} for Next.js`);
    }

    console.log('\nTo install rules for another stack, run this tool again.');
};

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});