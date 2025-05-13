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


// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        stack: 'laravel',
        global: true,
        root: 'testing',
        cursorPath: '.',
        projectPath: './',
        mirrorDocs: false,
        version: "12",
        architecture: 'standard',
        debug: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--debug') {
            options.debug = true;
            continue;
        }

        if (arg === '--stack' && i + 1 < args.length) {
            options.stack = args[++i];
            continue;
        }

        if (arg === '--version' && i + 1 < args.length) {
            options.version = args[++i];
            continue;
        }

        if (arg === '--architecture' && i + 1 < args.length) {
            options.architecture = args[++i];
            continue;
        }

        if (arg === '--root' && i + 1 < args.length) {
            options.root = args[++i];
            continue;
        }

        if (arg === '--no-global') {
            options.global = false;
            continue;
        }
    }

    return options;
}

async function testCLI() {
    console.log(chalk.blue('🧪 Testing Agent Rules Kit with predefined values'));

    // Get settings from command line args
    const cmdArgs = parseArgs();

    // Predefined settings
    const settings = {
        selected: cmdArgs.stack,
        global: cmdArgs.global,
        root: cmdArgs.root,
        cursorPath: cmdArgs.cursorPath,
        projectPath: cmdArgs.projectPath,
        mirrorDocs: cmdArgs.mirrorDocs,
        selectedVersion: cmdArgs.version,
        architecture: cmdArgs.architecture,
        debug: cmdArgs.debug
    };

    // Set DEBUG_MODE constant
    const DEBUG_MODE = settings.debug;

    // Instanciar servicios
    const fileService = new FileService({ debug: DEBUG_MODE, templatesDir });
    const configService = new ConfigService({ debug: DEBUG_MODE, templatesDir });

    // StackService necesita configService con fileService ya configurado
    const stackService = new StackService({
        debug: DEBUG_MODE,
        configService,
        fileService,
        templatesDir
    });

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
                if (f.endsWith('.md')) {
                    const srcFile = path.join(globalDir, f);
                    const destFile = path.join(globalFolder, `${f}`.replace(/\.md$/, '.mdc'));
                    const meta = {
                        projectPath: settings.projectPath,
                        cursorPath: settings.cursorPath,
                        debug: settings.debug
                    };
                    fileService.wrapMdToMdc(srcFile, destFile, meta);
                }
            });
            console.log(chalk.green(`✅ Applied global rules`));
        }
    }

    // Generate stack rules
    try {
        // Cargar la configuración real
        const kitConfig = configService.getConfig();

        // Preparar metadata con la nueva estructura
        const meta = {
            stack: settings.selected,
            architecture: settings.architecture,
            detectedVersion: settings.selectedVersion,
            projectPath: settings.projectPath,
            cursorPath: settings.cursorPath,
            versionRange: stackService.mapVersionToRange(settings.selected, settings.selectedVersion),
            formattedVersionName: stackService.getFormattedVersionName(settings.selected, settings.selectedVersion)
        };

        await stackService.generateRulesAsync(
            targetRules,
            meta,
            kitConfig,
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