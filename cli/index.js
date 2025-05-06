#!/usr/bin/env node
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as versionDetector from './version-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

const stacks = ['laravel', 'nextjs', 'nestjs', 'react', 'angular', 'astro', 'generic'];
console.log(`Available stacks: ${stacks.join(', ')}`);

// Laravel architecture options
const laravelArchitectures = [
    { name: 'Standard Laravel (MVC with Repositories)', value: 'standard' },
    { name: 'Domain-Driven Design (DDD)', value: 'ddd' },
    { name: 'Hexagonal Architecture (Ports and Adapters)', value: 'hexagonal' },
];

// Next.js router mode options
const nextjsRouterModes = [
    { name: 'App Router (for Next.js 13+)', value: 'app' },
    { name: 'Pages Router (traditional)', value: 'pages' },
    { name: 'Both Routers (hybrid app)', value: 'hybrid' },
];

// Add front matter to markdown files
const addFrontMatter = (body, meta) =>
    `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}`;

// Convert markdown to markdown with front matter
const wrapMdToMdc = (src, destFile, meta = {}) => {
    const md = fs.readFileSync(src, 'utf8');
    fs.outputFileSync(destFile, addFrontMatter(md, meta));
};

// Copy rule groups - this is only used for mirror docs now
const copyRuleGroup = (tmplDir, destDir, meta = {}) => {
    if (!fs.existsSync(tmplDir)) {
        return;
    }

    fs.readdirSync(tmplDir).forEach(f => {
        const srcFile = path.join(tmplDir, f);
        const destFile = path.join(destDir, f);

        // For documentation mirroring, we want to preserve the original file extension
        if (destDir.includes('docs/')) {
            fs.copyFileSync(srcFile, destFile);
        } else {
            // This should not normally be used for rules anymore
            // But kept for backward compatibility
            const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
            wrapMdToMdc(srcFile, mdcFile, meta);
        }
    });
};

// Copy version-specific overlay
const copyVersionOverlay = (stack, versionDir, targetRules) => {
    if (!versionDir) return;

    const overlayDir = path.join(templatesDir, 'stacks', stack, versionDir);
    if (fs.existsSync(overlayDir)) {
        fs.readdirSync(overlayDir).forEach(f => {
            const srcFile = path.join(overlayDir, f);
            // Write directly to rules directory with a prefixed filename for organization
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            // Store in stack-specific subfolder
            const stackFolder = path.join(targetRules, stack);
            fs.ensureDirSync(stackFolder); // Ensure stack folder exists
            const destFile = path.join(stackFolder, fileName);
            wrapMdToMdc(srcFile, destFile);
        });
        console.log(`→ Applied ${stack} ${versionDir} overlay`);
    }
};

// Copy architecture-specific rules
const copyArchitectureRules = (stack, architecture, targetRules) => {
    if (!architecture || stack !== 'laravel') return;

    const archDir = path.join(templatesDir, 'architectures', stack, architecture);
    if (fs.existsSync(archDir)) {
        fs.readdirSync(archDir).forEach(f => {
            const srcFile = path.join(archDir, f);
            // Write to stack folder with architecture prefix
            const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
            // Store in stack folder
            const stackFolder = path.join(targetRules, stack);
            fs.ensureDirSync(stackFolder); // Ensure stack folder exists
            const destFile = path.join(stackFolder, fileName);
            wrapMdToMdc(srcFile, destFile);
        });
        console.log(`→ Applied ${stack} ${architecture} architecture rules`);
    }
};

// Copy router-specific rules for Next.js
const copyRouterRules = (routerMode, targetRules) => {
    if (!routerMode) return;

    const routerDirs = [];
    if (routerMode === 'app' || routerMode === 'hybrid') {
        routerDirs.push(path.join(templatesDir, 'stacks/nextjs/routers/app'));
    }
    if (routerMode === 'pages' || routerMode === 'hybrid') {
        routerDirs.push(path.join(templatesDir, 'stacks/nextjs/routers/pages'));
    }

    routerDirs.forEach(dirPath => {
        if (fs.existsSync(dirPath)) {
            const routerType = path.basename(dirPath);
            fs.readdirSync(dirPath).forEach(f => {
                const srcFile = path.join(dirPath, f);
                // Write to router subfolder
                const fileName = `${f}`.replace(/\.md$/, '.mdc');
                // Store in nextjs/router subfolder
                const routerFolder = path.join(targetRules, 'nextjs', 'router', routerType);
                fs.ensureDirSync(routerFolder); // Ensure router folder exists
                const destFile = path.join(routerFolder, fileName);
                wrapMdToMdc(srcFile, destFile);
            });
            console.log(`→ Applied Next.js ${routerType} router rules`);
        }
    });
};

// Copy stack rules with version detection
const copyStack = async (stack, targetRules, projectPath, options = {}) => {
    console.log(`\n----- Copying rules for ${stack} -----`);
    console.log(`Target rules directory: ${targetRules}`);
    console.log(`Project path: ${projectPath}`);

    // Copy base rules
    const baseDir = path.join(templatesDir, 'stacks', stack, 'base');
    console.log(`Looking for base rules at: ${baseDir}`);

    // Check if base directory exists
    if (!fs.existsSync(baseDir)) {
        console.error(`Base directory not found: ${baseDir}`);
    } else {
        console.log(`Found base directory with ${fs.readdirSync(baseDir).length} files`);
    }

    // Add version information to base rules
    let versionMeta = {};
    const version = versionDetector.detectVersion(stack, projectPath);
    if (version) {
        const versionRange = versionDetector.mapVersionToRange(stack, version, templatesDir) || `v${version}`;
        console.log(`Using version metadata: ${version} (${versionRange})`);
        versionMeta = {
            detectedVersion: version,
            versionRange: versionRange
        };
    } else {
        console.log(`No version detected for ${stack}, using base rules only`);
    }

    // Iterate over base files and add project path and version info
    if (fs.existsSync(baseDir)) {
        const baseFiles = fs.readdirSync(baseDir);
        console.log(`Processing ${baseFiles.length} base files for ${stack}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, stack);
        fs.ensureDirSync(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Store in stack folder with original filename
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            console.log(`Copying ${f} to ${fileName}`);

            // Custom metadata for each file
            const fileMeta = {
                ...versionMeta,
                stack: stack,
                projectPath: projectPath !== '.' ? projectPath : '',
            };

            wrapMdToMdc(srcFile, destFile, fileMeta);
        });
        console.log(`Finished copying base rules for ${stack}`);
    }

    // Apply version-specific rules
    const versionDir = versionDetector.getVersionDirectory(templatesDir, stack, projectPath);
    if (versionDir) {
        console.log(`Applying version-specific rules from ${versionDir}`);
        copyVersionOverlay(stack, versionDir, targetRules);
    } else {
        console.log(`No version-specific rules to apply for ${stack}`);
    }

    // Apply architecture-specific rules for Laravel
    if (stack === 'laravel' && options.architecture) {
        console.log(`Applying architecture rules for ${options.architecture}`);
        copyArchitectureRules(stack, options.architecture, targetRules);
    }

    // Apply router-specific rules for Next.js
    if (stack === 'nextjs' && options.routerMode) {
        console.log(`Applying router rules for ${options.routerMode}`);
        copyRouterRules(options.routerMode, targetRules);
    }

    console.log(`----- Finished processing ${stack} -----\n`);
};

const main = async () => {
    console.log('🛠️  Agent Rules Kit - Installation');
    console.log('Note: If you need to install multiple stacks, run this tool once for each stack.');

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selected',
            message: 'Select a stack to install:',
            choices: stacks,
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

    // Ask for framework-specific options
    let architecture = null;
    let routerMode = null;

    // Convert single selection to array format for backward compatibility
    const selectedStacks = [answers.selected];
    console.log(`Selected stack: ${answers.selected}`);

    if (answers.selected === 'laravel') {
        console.log(`Laravel selected, asking for architecture...`);
        const archAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: 'Select Laravel architecture style:',
                choices: laravelArchitectures
            }
        ]);
        architecture = archAnswer.architecture;
        console.log(`Selected Laravel architecture: ${architecture}`);
    } else {
        console.log(`Laravel not selected, skipping architecture prompt`);
    }

    if (answers.selected === 'nextjs') {
        const routerAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'routerMode',
                message: 'Select Next.js router mode:',
                choices: nextjsRouterModes
            }
        ]);
        routerMode = routerAnswer.routerMode;
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
    await copyStack(answers.selected, targetRules, answers.projectPath, { architecture, routerMode });

    // Copy mirror docs if requested
    if (answers.mirrorDocs) {
        if (answers.global) {
            fs.copySync(path.join(templatesDir, 'global'), path.join(targetDocs, 'global'));
        }

        // Copy base docs directly
        copyRuleGroup(
            path.join(templatesDir, 'stacks', answers.selected, 'base'),
            path.join(targetDocs, answers.selected)
        );

        // Copy version-specific docs
        const versionDir = versionDetector.getVersionDirectory(templatesDir, answers.selected, answers.projectPath);
        if (versionDir) {
            const versionDirPath = path.join(templatesDir, 'stacks', answers.selected, versionDir);
            if (fs.existsSync(versionDirPath)) {
                copyRuleGroup(
                    versionDirPath,
                    path.join(targetDocs, answers.selected, 'version-specific')
                );
            }
        }

        // Copy architecture docs for Laravel
        if (answers.selected === 'laravel' && architecture) {
            const archDirPath = path.join(templatesDir, 'stacks', answers.selected, 'architectures', architecture);
            if (fs.existsSync(archDirPath)) {
                copyRuleGroup(
                    archDirPath,
                    path.join(targetDocs, answers.selected, 'architecture')
                );
            }
        }

        // Copy router docs for Next.js
        if (answers.selected === 'nextjs' && routerMode) {
            if (routerMode === 'app' || routerMode === 'hybrid') {
                const appRouterPath = path.join(templatesDir, 'stacks/nextjs/routers/app');
                if (fs.existsSync(appRouterPath)) {
                    copyRuleGroup(
                        appRouterPath,
                        path.join(targetDocs, answers.selected, 'router/app')
                    );
                }
            }
            if (routerMode === 'pages' || routerMode === 'hybrid') {
                const pagesRouterPath = path.join(templatesDir, 'stacks/nextjs/routers/pages');
                if (fs.existsSync(pagesRouterPath)) {
                    copyRuleGroup(
                        pagesRouterPath,
                        path.join(targetDocs, answers.selected, 'router/pages')
                    );
                }
            }
        }
    }

    console.log('✅  Rules installed successfully in .cursor/rules/rules-kit/ directory');
    console.log('   Global rules: .cursor/rules/rules-kit/global/');
    console.log(`   Stack rules: .cursor/rules/rules-kit/${answers.selected}/`);

    // Detect and report versions
    const version = versionDetector.detectVersion(answers.selected, answers.projectPath);
    if (version) {
        console.log(`→ Detected ${answers.selected} version ${version}`);
        const versionRange = versionDetector.mapVersionToRange(answers.selected, version, templatesDir);
        if (versionRange) {
            console.log(`  Applied ${versionRange} rules`);
        }
    }

    // Report architecture for Laravel
    if (answers.selected === 'laravel' && architecture) {
        const archName = laravelArchitectures.find(a => a.value === architecture)?.name || architecture;
        console.log(`→ Using ${archName} for Laravel`);
    }

    // Report router mode for Next.js
    if (answers.selected === 'nextjs' && routerMode) {
        const routerName = nextjsRouterModes.find(r => r.value === routerMode)?.name || routerMode;
        console.log(`→ Using ${routerName} for Next.js`);
    }

    console.log('\nTo install rules for another stack, run this tool again.');
};

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});