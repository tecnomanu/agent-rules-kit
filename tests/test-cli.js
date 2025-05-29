#!/usr/bin/env node
/**
 * Test CLI for Agent Rules Kit
 * 
 * This utility helps test the Agent Rules Kit by generating rules for different stacks,
 * architectures, and versions without needing to use the full CLI interface.
 * 
 * Usage:
 *   node test-cli.js [options]
 * 
 * Options:
 *   --stack=<stack>            Stack to generate rules for (laravel, nextjs, astro, etc.)
 *   --architecture=<arch>      Architecture to use (standard, ddd, etc.)
 *   --version=<version>        Version of the stack (e.g., 3, 14, 12)
 *   --project-path=<path>      Path to the project (default: './')
 *   --root=<path>              Path where rules will be generated (default: 'test')
 *   --cursor-path=<path>       Path to cursor (default: '.')
 *   --no-global                Skip global rules
 *   --debug                    Enable debug output
 *   --help                     Show this help message
 * 
 * Examples:
 *   # Test Astro rules generation with version 3
 *   node test-cli.js --stack=astro --version=3 --debug
 * 
 *   # Test Laravel rules with DDD architecture
 *   node test-cli.js --stack=laravel --architecture=ddd --version=11
 * 
 *   # Test Next.js with specific project path
 *   node test-cli.js --stack=nextjs --version=14 --project-path=/path/to/nextjs/project
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConfigService } from '../cli/services/config-service.js';
import { FileService } from '../cli/services/file-service.js';
import { StackService } from '../cli/services/stack/stack-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '..', 'templates');


// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        stack: 'laravel',
        global: true,
        root: 'test',
        cursorPath: '.',
        projectPath: './',
        mirrorDocs: false,
        version: "12",
        architecture: 'standard',
        debug: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Check for --help flag
        if (arg === '--help' || arg === '-h') {
            options.help = true;
            continue;
        }

        // Check for --debug flag
        if (arg === '--debug') {
            options.debug = true;
            continue;
        }

        // Check for --no-global flag
        if (arg === '--no-global') {
            options.global = false;
            continue;
        }

        // Process key=value parameters
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (value !== undefined) {
                switch (key) {
                    case 'stack':
                        options.stack = value;
                        break;
                    case 'version':
                        options.version = value;
                        break;
                    case 'architecture':
                        options.architecture = value;
                        break;
                    case 'root':
                        options.root = value;
                        break;
                    case 'project-path':
                        options.projectPath = value;
                        break;
                    case 'cursor-path':
                        options.cursorPath = value;
                        break;
                }
                continue;
            }
        }

        // Handle classic format (for backward compatibility)
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

        if (arg === '--project-path' && i + 1 < args.length) {
            options.projectPath = args[++i];
            continue;
        }

        if (arg === '--cursor-path' && i + 1 < args.length) {
            options.cursorPath = args[++i];
            continue;
        }
    }

    return options;
}

// Display help information
function showHelp() {
    const helpText = `
${chalk.bold('Agent Rules Kit Test Utility')}

${chalk.yellow('Usage:')}
  node test-cli.js [options]

${chalk.yellow('Options:')}
  --stack=<stack>            Stack to generate rules for (laravel, nextjs, astro, etc.)
  --architecture=<arch>      Architecture to use (standard, ddd, etc.)
  --version=<version>        Version of the stack (e.g., 3, 14, 12)
  --project-path=<path>      Path to the project (default: './')
  --root=<path>              Path where rules will be generated (default: 'test')
  --cursor-path=<path>       Path to cursor (default: '.')
  --no-global                Skip global rules
  --debug                    Enable debug output
  --help                     Show this help message

${chalk.yellow('Examples:')}
  # Test Astro rules generation with version 3
  node test-cli.js --stack=astro --version=3 --debug

  # Test Laravel rules with DDD architecture
  node test-cli.js --stack=laravel --architecture=ddd --version=11

  # Test Next.js with specific project path
  node test-cli.js --stack=nextjs --version=14 --project-path=/path/to/nextjs/project
`;

    console.log(helpText);
}

async function testCLI() {
    // Get settings from command line args
    const cmdArgs = parseArgs();

    // Show help and exit if requested
    if (cmdArgs.help) {
        showHelp();
        return;
    }

    console.log(chalk.blue('🧪 Testing Agent Rules Kit'));

    // Prepare settings
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

    console.log(chalk.cyan('Test settings:'), settings);

    // Set DEBUG_MODE constant
    const DEBUG_MODE = settings.debug;

    // Initialize services
    const fileService = new FileService({ debug: DEBUG_MODE, templatesDir });
    const configService = new ConfigService({ debug: DEBUG_MODE, templatesDir });

    // StackService needs configService with fileService already configured
    const stackService = new StackService({
        debug: DEBUG_MODE,
        configService,
        fileService,
        templatesDir
    });

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

    // Copy global rules if requested
    if (settings.global) {
        const config = configService.getConfig();
        const meta = {
            projectPath: settings.projectPath,
            cursorPath: settings.cursorPath,
            debug: settings.debug
        };
        await stackService.copyGlobalRules(targetRules, meta, config);
        console.log(chalk.green(`✅ Global rules copied successfully!`));
    }

    // Generate stack rules
    try {
        // Load actual configuration
        const kitConfig = configService.getConfig();

        // Prepare metadata with the new structure
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
            false // Don't include global rules because we already copied them manually
        );

        console.log(chalk.green(`\n✅ Test completed. Check the output files in: ${targetRules}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error generating rules: ${error.message}`));
        throw error;
    }
}

// Flag to handle errors
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