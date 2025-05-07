#!/usr/bin/env node

/**
 * Main entry point for Agent Rules Kit
 * New services architecture v1.0.0
 */
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

import { BaseService } from './services/base-service.js';
import { CliService } from './services/cli-service.js';
import { ConfigService } from './services/config-service.js';
import { FileService } from './services/file-service.js';
import { LaravelService } from './services/laravel-service.js';
import { NextjsService } from './services/nextjs-service.js';
import { ReactService } from './services/react-service.js';
import { StackService } from './services/stack-service.js';

// Path configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

// Parse command line arguments
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');

// Initialize services
const baseService = new BaseService({ debug: debugMode });
const configService = new ConfigService({ debug: debugMode, templatesDir });
const fileService = new FileService({ debug: debugMode, templatesDir });
const cliService = new CliService({ debug: debugMode });
const stackService = new StackService({
    debug: debugMode,
    configService,
    templatesDir
});

// Stack-specific services
const laravelService = new LaravelService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

const nextjsService = new NextjsService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

const reactService = new ReactService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

const version = '1.0.0' //TODO:tomar la version del package.json

/**
 * Main function
 */
async function main() {
    cliService.showBanner(`🚀 Agent Rules Kit v${version}`, true);

    // Get available stacks from the service
    const availableStacks = stackService.getAvailableStacks().map(stack => ({
        name: stack.charAt(0).toUpperCase() + stack.slice(1), // Capitalize first letter
        value: stack
    }));

    if (availableStacks.length === 0) {
        cliService.error('No stacks found in the kit-config.json or stacks directory');
        process.exit(1);
    }

    // Ask for the stack to use
    const stack = await cliService.askStack(availableStacks);

    // Ask for the relative path to the project
    const projectPath = await cliService.askProjectPath();

    // Try to detect the stack version
    const detectedVersion = stackService.detectStackVersion(stack, projectPath);
    if (detectedVersion) {
        cliService.info(`Detected ${stack} version: ${detectedVersion}`);
    }

    // Format the rules directory path - always in .cursor/rules/rules-kit
    const rulesDir = stackService.formatRulesPath(projectPath);

    // Check if rules directory already exists and create backup if needed
    if (baseService.directoryExists(rulesDir)) {
        const action = await cliService.askDirectoryAction(rulesDir);

        if (action === 'cancel') {
            cliService.info('Operation cancelled by user');
            process.exit(0);
        }

        if (action === 'backup') {
            const backupDir = stackService.createBackup(rulesDir);
            if (backupDir) {
                cliService.backupCreated(rulesDir, backupDir);
            }
        }
    }

    // Ask if global rules should be included
    const includeGlobalRules = await cliService.askIncludeGlobalRules();

    // Ensure the rules directory exists
    baseService.ensureDirectoryExists(rulesDir);

    // Stack-specific questions
    let additionalOptions = {};

    if (stack === 'laravel') {
        // Get available architectures for Laravel
        const architectures = stackService.getAvailableArchitectures(stack);
        const architecture = await cliService.askArchitecture(architectures, stack);

        // Get available versions for Laravel
        const versions = stackService.getAvailableVersions(stack);
        const version = await cliService.askVersion(versions, detectedVersion);

        // Map specific version to version range if needed
        const versionRange = stackService.mapVersionToRange(stack, version);

        // Get formatted version name for display
        const formattedVersionName = stackService.getFormattedVersionName(stack, versionRange);

        additionalOptions = {
            architecture,
            detectedVersion: version,
            versionRange,
            formattedVersionName
        };
    }
    else if (stack === 'nextjs') {
        // Get available architectures for Next.js
        const architectures = stackService.getAvailableArchitectures(stack);
        const architecture = await cliService.askArchitecture(architectures, stack);

        // Get available versions for Next.js
        const versions = stackService.getAvailableVersions(stack);
        const version = await cliService.askVersion(versions, detectedVersion);

        // Map specific version to version range if needed
        const versionRange = stackService.mapVersionToRange(stack, version);

        // Get formatted version name for display
        const formattedVersionName = stackService.getFormattedVersionName(stack, versionRange);

        additionalOptions = {
            architecture,
            detectedVersion: version,
            versionRange,
            formattedVersionName
        };
    }
    else if (stack === 'react') {
        // Get available architectures for React
        const architectures = stackService.getAvailableArchitectures(stack);
        const architecture = await cliService.askArchitecture(architectures, stack);

        // Get available state management options
        // TODO: In the future, get these from configuration too
        const stateManagementOptions = [
            'redux',
            'redux-toolkit',
            'context',
            'react-query',
            'zustand'
        ];
        const stateManagement = await cliService.askStateManagement(stateManagementOptions);

        // Get available versions for React
        const versions = stackService.getAvailableVersions(stack);
        const version = await cliService.askVersion(versions, detectedVersion);

        // Map specific version to version range if needed
        const versionRange = stackService.mapVersionToRange(stack, version);

        // Get formatted version name for display
        const formattedVersionName = stackService.getFormattedVersionName(stack, versionRange);

        additionalOptions = {
            architecture,
            stateManagement,
            detectedVersion: version,
            versionRange,
            formattedVersionName
        };
    } else {
        // For other stacks, fetch available versions and architectures when available
        const architectures = stackService.getAvailableArchitectures(stack);
        if (architectures.length > 0) {
            additionalOptions.architecture = await cliService.askArchitecture(architectures, stack);
        }

        const versions = stackService.getAvailableVersions(stack);
        if (versions.length > 0) {
            const version = await cliService.askVersion(versions, detectedVersion);
            additionalOptions.detectedVersion = version;
            additionalOptions.versionRange = stackService.mapVersionToRange(stack, version);
            additionalOptions.formattedVersionName = stackService.getFormattedVersionName(
                stack,
                additionalOptions.versionRange
            );
        }
    }

    // Common metadata
    const meta = {
        stack,
        projectPath,
        debug: debugMode,
        includeGlobalRules,
        ...additionalOptions
    };

    // Process the selected stack
    cliService.processing(`Processing rules for ${stack}...`);

    // Create the stack-specific directory 
    const stackRulesDir = path.join(rulesDir, stack);
    baseService.ensureDirectoryExists(stackRulesDir);

    // Copy global rules if requested
    if (includeGlobalRules) {
        cliService.processing('Copying global best-practice rules...');
        const globalRules = configService.getGlobalRules();

        if (globalRules.length > 0) {
            const globalDir = path.join(rulesDir, 'global');
            baseService.ensureDirectoryExists(globalDir);

            for (const rule of globalRules) {
                const sourceFile = path.join(templatesDir, 'global', rule);
                const destFile = path.join(globalDir, rule);

                // Process template variables and copy file
                try {
                    const content = fileService.readFile(sourceFile);
                    const processedContent = configService.processTemplateVariables(content, meta);
                    fileService.writeFile(destFile, processedContent);
                    cliService.info(`Global rule copied: ${rule}`);
                } catch (error) {
                    cliService.warning(`Failed to copy global rule ${rule}: ${error.message}`);
                }
            }
        }
    }

    // Use the appropriate service based on the stack
    let success = false;
    switch (stack) {
        case 'laravel':
            success = await laravelService.copyBaseRules(rulesDir, meta, {
                projectPath
            });

            if (success && additionalOptions.versionRange) {
                await laravelService.copyVersionOverlay(additionalOptions.versionRange, rulesDir, {
                    ...meta,
                    projectPath
                });
            }

            if (success && additionalOptions.architecture) {
                await laravelService.copyArchitectureRules(additionalOptions.architecture, rulesDir, {
                    ...meta,
                    projectPath
                });
            }
            break;

        case 'nextjs':
            success = await nextjsService.copyBaseRules(rulesDir, meta, {
                projectPath
            });

            if (success && additionalOptions.versionRange) {
                await nextjsService.copyVersionOverlay(additionalOptions.versionRange, rulesDir, {
                    ...meta,
                    projectPath
                });
            }

            if (success && additionalOptions.architecture) {
                await nextjsService.copyArchitectureRules(additionalOptions.architecture, rulesDir, {
                    ...meta,
                    projectPath
                });
            }
            break;

        case 'react':
            success = await reactService.copyBaseRules(rulesDir, meta, {
                projectPath
            });

            if (success && additionalOptions.architecture) {
                await reactService.copyArchitectureRules(additionalOptions.architecture, rulesDir, {
                    ...meta,
                    projectPath
                });
            }

            if (success && additionalOptions.stateManagement) {
                await reactService.copyStateManagementRules(additionalOptions.stateManagement, rulesDir, {
                    ...meta,
                    projectPath
                });
            }
            break;

        default:
            cliService.error(`Unsupported stack: ${stack}`);
            process.exit(1);
    }

    if (success) {
        cliService.success(`Rules for ${stack} successfully generated`);

        console.log(chalk.cyan('\n📖 Documentation:'));
        console.log(chalk.blue('  - Global Rules: ') + chalk.white(`${rulesDir}/global`));
        console.log(chalk.blue('  - Stack Rules: ') + chalk.white(`${rulesDir}/${stack}`));

        console.log(chalk.green('\n✅ All done! ') + chalk.white('Import the rules in Cursor with the "Import Rules" command'));
    } else {
        cliService.error(`Failed to generate rules for ${stack}`);
        process.exit(1);
    }
}

// Execute the application
main().catch(error => {
    cliService.error(`Unexpected error: ${error.message}`);
    if (debugMode) {
        console.error(error);
    }
    process.exit(1);
});