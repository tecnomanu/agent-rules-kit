#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConfigService } from './cli/services/config-service.js';
import { FileService } from './cli/services/file-service.js';
import { StackService } from './cli/services/stack-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, 'templates');

// Verificar si el modo debug está activado
const DEBUG_MODE = process.argv.includes('--debug');

async function testCLI() {
    console.log(chalk.blue('🧪 Testing Agent Rules Kit with predefined values'));

    // Instanciar servicios
    const fileService = new FileService({ debug: DEBUG_MODE });
    const configService = new ConfigService({ debug: DEBUG_MODE, templatesDir });

    // Asignar fileService a configService
    configService.fileService = fileService;

    // StackService necesita configService con fileService ya configurado
    const stackService = new StackService({
        debug: DEBUG_MODE,
        configService,
        fileService,
        templatesDir
    });

    // Predefined settings
    const settings = {
        selected: 'laravel',
        global: true,
        root: 'testing',
        projectPath: '.',
        mirrorDocs: false,
        selectedVersion: "12", // Convertido a string para evitar errores con version.replace
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
                fileService.wrapMdToMdc(srcFile, destFile, meta);
            });
            console.log(chalk.green(`✅ Applied global rules`));
        }
    }

    // Generate stack rules
    try {
        const meta = {
            stack: settings.selected,
            architecture: settings.architecture,
            detectedVersion: settings.selectedVersion,
            projectPath: settings.projectPath,
        };

        const config = {
            debug: settings.debug
        };

        await stackService.generateRulesAsync(
            targetRules,
            meta,
            config,
            (progress) => {
                if (settings.debug) {
                    console.log(`Progress: ${progress}%`);
                }
            },
            false // No incluir reglas globales porque ya las copiamos manualmente
        );

        console.log(chalk.green(`\n✅ Test completed. Check the output files in: ${targetRules}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error generating rules: ${error.message}`));
        throw error;
    }
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