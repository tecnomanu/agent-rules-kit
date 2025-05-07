#!/usr/bin/env node
import chalk from 'chalk';
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

// Debug mode flag
let DEBUG_MODE = process.argv.includes('--debug');

// Helper for logging when in debug mode
const debugLog = (...args) => {
    if (DEBUG_MODE) {
        console.log(chalk.gray('[DEBUG]'), ...args);
    }
};

console.log(chalk.blue('🧰 Agent Rules Kit - CLI'));
debugLog(`Available stacks: ${STACKS.join(', ')}`);

/**
 * Create a backup of existing rules
 * @param {string} targetRules - Target rules directory
 * @returns {string} - Backup directory path
 */
const createBackup = (targetRules) => {
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    const backupDir = `${targetRules}_backup_${timestamp}`;

    if (fs.existsSync(targetRules)) {
        console.log(chalk.blue(`📦 Creating backup of existing rules...`));
        try {
            fs.copySync(targetRules, backupDir);
            debugLog(DEBUG_MODE, `Backup created successfully at: ${backupDir}`);
        } catch (error) {
            console.error(chalk.red(`❌ Error creating backup: ${error.message}`));
            debugLog(DEBUG_MODE, error.stack);
        }
    }

    return backupDir;
};

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
        console.log(`\n${chalk.green('✅')} Detected ${chalk.cyan(stack)} version: ${chalk.bold(detectedVersion)} (compatibility: ${chalk.bold(versionRange)})`);

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
        console.log(`\n${chalk.yellow('⚠️')} Could not automatically detect ${chalk.cyan(stack)} version.`);
    }

    // Get available versions from kit-config.json
    const config = loadKitConfig(templatesDir);
    const versionRanges = config.version_ranges?.[stack] || {};
    const availableVersions = Object.keys(versionRanges).map(Number).sort((a, b) => b - a);

    if (availableVersions.length === 0) {
        console.log(chalk.red(`❌ No versions configured for ${stack}.`));
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
    console.log(chalk.blue('🛠️  Agent Rules Kit - Installation'));
    console.log(chalk.italic('Note: If you need to install multiple stacks, run this tool once for each stack.'));

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
            message: 'Relative path to your project (if not in the root, from .cursor directory):',
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

        debugLog(`Laravel selected, asking for architecture...`);
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
        console.log(`${chalk.green('✅')} Selected Laravel architecture: ${chalk.cyan(architecture)}`);
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
        console.log(`${chalk.green('✅')} Selected Next.js architecture: ${chalk.cyan(architecture)}`);
    }

    // Use rules-kit subfolder instead of putting everything in rules/
    const targetRules = path.join(process.cwd(), answers.root, '.cursor', 'rules', 'rules-kit');
    const targetDocs = path.join(process.cwd(), 'docs');

    // Check if rules directory already exists
    if (fs.existsSync(targetRules)) {
        const stackDir = path.join(targetRules, answers.selected);
        const hasExistingStack = fs.existsSync(stackDir);

        console.log(chalk.yellow(`⚠️  The rules directory ${targetRules} already exists.`));
        if (hasExistingStack) {
            console.log(chalk.yellow(`⚠️  Rules for stack ${answers.selected} already exist in this directory.`));
        }

        const backupPrompt = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'How would you like to proceed with existing rules?',
                choices: [
                    { name: '📦 Create backup and continue (recommended)', value: 'backup' },
                    { name: '⚠️  Overwrite without backup', value: 'overwrite' },
                    { name: '❌ Cancel installation', value: 'cancel' }
                ],
                default: 'backup'
            }
        ]);

        if (backupPrompt.action === 'cancel') {
            console.log(chalk.red('❌ Installation cancelled.'));
            return;
        } else if (backupPrompt.action === 'backup') {
            const backupDir = createBackup(targetRules);
            console.log(chalk.green(`✅ Backup created at: ${chalk.cyan(backupDir)}`));
        }

        // Remove existing directory for the selected stack
        if (hasExistingStack) {
            console.log(chalk.yellow(`🗑️  Removing existing ${chalk.cyan(answers.selected)} rules...`));
            fs.removeSync(stackDir);
        }
    }

    // Ensure the rules directory exists
    debugLog(`Ensuring rules directory exists: ${targetRules}`);
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
                    projectPath: answers.projectPath,
                    debug: DEBUG_MODE
                };
                wrapMdToMdc(srcFile, destFile, meta);
            });
            console.log(chalk.green(`✅ Applied global rules`));
        }
    }

    // Copy selected stack rules
    await copyStack(
        templatesDir,
        answers.selected,
        targetRules,
        answers.projectPath ?? '.',
        {
            architecture,
            selectedVersion,
            debug: DEBUG_MODE
        }
    );

    // Apply Next.js specific architecture rules if needed
    if (answers.selected === 'nextjs' && architecture) {
        debugLog(`Applying Next.js architecture rules for ${architecture}`);
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
                console.log(`${chalk.green('✅')} Global documentation copied to ${globalDocsDir}`);
            }
        }

        // Copy stack docs
        const stackDocsDir = path.join(targetDocs, answers.selected);
        fs.ensureDirSync(stackDocsDir);

        // Copy base docs
        const baseDir = path.join(templatesDir, 'stacks', answers.selected, 'base');
        if (fs.existsSync(baseDir)) {
            copyRuleGroup(baseDir, stackDocsDir);
            debugLog(`Base ${answers.selected} documentation copied to ${stackDocsDir}`);
        }

        // Copy version-specific docs
        const versionDir = versionDetector.getVersionDirectory(templatesDir, answers.selected, answers.projectPath);
        if (versionDir) {
            const versionDocsDir = path.join(stackDocsDir, versionDir);
            fs.ensureDirSync(versionDocsDir);
            const versionSrcDir = path.join(templatesDir, 'stacks', answers.selected, versionDir);
            if (fs.existsSync(versionSrcDir)) {
                copyRuleGroup(versionSrcDir, versionDocsDir);
                debugLog(`${answers.selected} ${versionDir} documentation copied to ${versionDocsDir}`);
            }
        }

        // Copy architecture docs for Laravel
        if (answers.selected === 'laravel' && architecture) {
            // Check new directory structure first
            const newArchDocsDir = path.join(stackDocsDir, 'architectures', architecture);
            fs.ensureDirSync(newArchDocsDir);

            const newArchSrcDir = path.join(templatesDir, 'stacks', 'laravel', 'architectures', architecture);
            if (fs.existsSync(newArchSrcDir)) {
                copyRuleGroup(newArchSrcDir, newArchDocsDir);
                debugLog(`Laravel ${architecture} architecture documentation copied to ${newArchDocsDir}`);
            } else {
                // Fallback to old structure
                const oldArchDocsDir = path.join(stackDocsDir, 'architectures', architecture);
                fs.ensureDirSync(oldArchDocsDir);

                const oldArchSrcDir = path.join(templatesDir, 'architectures', 'laravel', architecture);
                if (fs.existsSync(oldArchSrcDir)) {
                    copyRuleGroup(oldArchSrcDir, oldArchDocsDir);
                    debugLog(`Laravel ${architecture} architecture documentation copied to ${oldArchDocsDir}`);
                }
            }
        }
    }

    // Execute installation based on choices
    try {
        // Copy stack rules with proper version detection
        await copyStack(templatesDir, answers.selected, targetRules, answers.projectPath, {
            architecture: architecture,
            selectedVersion: selectedVersion,
            debug: DEBUG_MODE
        });

        // Generate mirror docs if requested
        if (answers.mirrorDocs) {
            console.log(chalk.blue('📚 Generating mirror documentation...'));
            // Create global mirror docs
            if (answers.global) {
                const globalDir = path.join(templatesDir, 'global');
                const mirrorGlobalDir = path.join(targetDocs, 'global');
                fs.ensureDirSync(mirrorGlobalDir);
                copyRuleGroup(globalDir, mirrorGlobalDir, { projectPath: answers.projectPath });
            }

            // Create stack mirror docs
            const stackSrcDir = path.join(templatesDir, 'stacks', answers.selected, 'base');
            const mirrorStackDir = path.join(targetDocs, answers.selected);
            fs.ensureDirSync(mirrorStackDir);
            copyRuleGroup(stackSrcDir, mirrorStackDir, {
                projectPath: answers.projectPath,
                stack: answers.selected,
                detectedVersion: selectedVersion
            });

            console.log(chalk.green(`✅ Mirror documentation generated in ${chalk.cyan(targetDocs)}`));
        }

        console.log(chalk.green(`\n🎉 Installation completed successfully!`));
        console.log(`${chalk.cyan('Rules installed at:')} ${chalk.bold(targetRules)}`);
        console.log(`${chalk.cyan('Detected stack:')} ${chalk.bold(answers.selected)} ${selectedVersion ? chalk.cyan(`v${selectedVersion}`) : ''}`);
        if (architecture) {
            console.log(`${chalk.cyan('Architecture:')} ${chalk.bold(architecture)}`);
        }
        console.log(chalk.blue('\n🚀 Your AI agent is now ready to help with your codebase!'));
    } catch (error) {
        console.error(chalk.red(`❌ Error during installation: ${error.message}`));
        debugLog(error.stack);
    }
};

// Flag for handling errors
let errorOccurred = false;

main().catch(err => {
    errorOccurred = true;
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
}).finally(() => {
    if (!errorOccurred) {
        console.log(chalk.blue('\n👋 Thank you for using Agent Rules Kit!'));
    }
});