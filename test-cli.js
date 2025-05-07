#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { wrapMdToMdc } from './cli/utils/file-helpers.js';
import { copyStack } from './cli/utils/stack-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, 'templates');

// Verificar si el modo debug está activado
const DEBUG_MODE = process.argv.includes('--debug');

async function testCLI() {
    console.log(chalk.blue('🧪 Testing Agent Rules Kit with predefined values'));

    // Predefined settings
    const settings = {
        selected: 'laravel',
        global: true,
        root: 'testing',
        projectPath: '.',
        mirrorDocs: false,
        selectedVersion: 12,
        architecture: 'standard',
        debug: DEBUG_MODE
    };

    console.log(chalk.cyan('Test settings:'), settings);

    // Clean up previous test files but keep the testing directory
    const cursorDir = path.join(process.cwd(), settings.root, '.cursor');
    if (fs.existsSync(cursorDir)) {
        console.log(chalk.yellow(`Cleaning up previous test files in ${cursorDir}`));
        fs.removeSync(cursorDir);
    } else {
        console.log(chalk.green(`Creating testing directory structure`));
        fs.ensureDirSync(path.join(process.cwd(), settings.root));
    }

    // Ensure target directory exists
    const targetRules = path.join(process.cwd(), settings.root, '.cursor', 'rules', 'rules-kit');
    fs.ensureDirSync(targetRules);

    // Copy global rules
    if (settings.global) {
        const globalDir = path.join(templatesDir, 'global');
        const globalFolder = path.join(targetRules, 'global');
        fs.ensureDirSync(globalFolder);

        if (fs.existsSync(globalDir)) {
            fs.readdirSync(globalDir).forEach(f => {
                const srcFile = path.join(globalDir, f);
                const destFile = path.join(globalFolder, `${f}`.replace(/\.md$/, '.mdc'));
                const meta = {
                    projectPath: settings.projectPath,
                    debug: settings.debug
                };
                wrapMdToMdc(srcFile, destFile, meta);
            });
            console.log(chalk.green(`✅ Applied global rules`));
        }
    }

    // Copy stack rules
    await copyStack(
        templatesDir,
        settings.selected,
        targetRules,
        settings.projectPath,
        {
            architecture: settings.architecture,
            selectedVersion: settings.selectedVersion,
            debug: settings.debug
        }
    );

    console.log(chalk.green(`\n✅ Test completed. Check the output files in: ${targetRules}`));
}

// Flag para manejar errores
let errorOccurred = false;

testCLI().catch(err => {
    errorOccurred = true;
    console.error(chalk.red('❌ Error:'), err);
    process.exit(1);
}).finally(() => {
    if (!errorOccurred) {
        console.log(chalk.blue('👋 Thank you for using Agent Rules Kit!'));
    }
}); 