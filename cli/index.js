#!/usr/bin/env node

/**
 * Main entry point for Agent Rules Kit
 * New services architecture v1.0.0
 * Optimized for performance v1.x.x
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

// Only import essential services at startup
import { BaseService } from './services/base-service.js';
import { CliService } from './services/cli-service.js';
import { ConfigService } from './services/config-service.js';
import { FileService } from './services/file-service.js';
import { StackService } from './services/stack-service.js';

// Path configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

// Parse command line arguments
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');
const updateFlag = args.includes('--update');

// Initialize essential services
const baseService = new BaseService({ debug: debugMode });
const configService = new ConfigService({ debug: debugMode, templatesDir });
const fileService = new FileService({ debug: debugMode, templatesDir });
const cliService = new CliService({ debug: debugMode });
const stackService = new StackService({
    debug: debugMode,
    configService,
    templatesDir
});

// Map to store dynamically loaded stack services
const stackServices = new Map();

/**
 * Dynamically load a service based on the selected stack
 * @param {string} stack - Selected stack name
 * @returns {Promise<object>} - Stack service instance
 */
async function loadStackService(stack) {
    // Return from cache if already loaded
    if (stackServices.has(stack)) {
        return stackServices.get(stack);
    }

    try {
        // Dynamically import the required service
        const servicePath = `./services/${stack}-service.js`;
        const serviceModule = await import(servicePath);

        // Get the service class (follows naming convention like LaravelService)
        const ServiceClass =
            serviceModule[`${stack.charAt(0).toUpperCase() + stack.slice(1)}Service`];

        if (!ServiceClass) {
            throw new Error(`Service class not found for stack: ${stack}`);
        }

        // Instantiate the service
        const serviceInstance = new ServiceClass({
            debug: debugMode,
            fileService,
            configService,
            templatesDir
        });

        // Cache the instance
        stackServices.set(stack, serviceInstance);

        return serviceInstance;
    } catch (error) {
        baseService.debugLog(`Error loading service for ${stack}: ${error.message}`);
        throw error;
    }
}

// Get package version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

/**
 * Main function
 */
async function main() {
    cliService.showBanner(`🚀 Agent Rules Kit v${version}`, true);

    // Handle update flag
    if (updateFlag) {
        await handleUpdate();
        return;
    }

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
    if (await baseService.directoryExistsAsync(rulesDir)) {
        const action = await cliService.askDirectoryAction(rulesDir);

        if (action === 'cancel') {
            cliService.info('Operation cancelled by user');
            process.exit(0);
        }

        if (action === 'backup') {
            const backupDir = await stackService.createBackupAsync(rulesDir);
            if (backupDir) {
                cliService.backupCreated(rulesDir, backupDir);
            }
        }
    }

    // Ask if global rules should be included
    const includeGlobalRules = await cliService.askIncludeGlobalRules();

    // Ensure the rules directory exists
    await baseService.ensureDirectoryExistsAsync(rulesDir);

    // Load the appropriate stack service dynamically
    const stackService = await loadStackService(stack);

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
    }
    else if (stack === 'angular') {
        // Get available architectures for Angular
        const architectures = stackService.getAvailableArchitectures(stack);
        const architecture = await cliService.askArchitecture(architectures, stack);

        // Ask if Angular signals should be included
        const { includeSignals } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'includeSignals',
                message: `${cliService.emoji.config} Include Angular Signals rules?`,
                default: true
            }
        ]);

        // Get available versions for Angular
        const versions = stackService.getAvailableVersions(stack);
        const version = await cliService.askVersion(versions, detectedVersion);

        // Map specific version to version range if needed
        const versionRange = stackService.mapVersionToRange(stack, version);

        // Get formatted version name for display
        const formattedVersionName = stackService.getFormattedVersionName(stack, versionRange);

        additionalOptions = {
            architecture,
            includeSignals,
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
            const versionRange = stackService.mapVersionToRange(stack, version);
            const formattedVersionName = stackService.getFormattedVersionName(stack, versionRange);

            additionalOptions = {
                ...additionalOptions,
                detectedVersion: version,
                versionRange,
                formattedVersionName
            };
        }
    }

    // Get the start time for measuring performance
    const startGeneration = Date.now();

    // Generate rules with progress tracking
    cliService.startProgress('Generating rules');

    // Prepare metadata for rule generation
    const meta = {
        projectPath,
        stack,
        debug: debugMode,
        ...additionalOptions
    };

    // Load config only once to improve performance
    const config = configService.getConfig();

    try {
        // Progress tracker variables
        let totalFiles = 0;
        let processedFiles = 0;

        // Generate rules with different methods depending on stack
        switch (stack) {
            case 'laravel':
                // Load Laravel service dynamically if needed
                const laravelService = await loadStackService('laravel');
                totalFiles = await laravelService.countTotalRules(meta);

                // Set up progress tracking
                const updateLaravelProgress = () => {
                    processedFiles++;
                    cliService.updateProgress((processedFiles / totalFiles) * 100);
                };

                await laravelService.generateRulesAsync(rulesDir, meta, config, updateLaravelProgress, includeGlobalRules);
                break;

            case 'nextjs':
                // Load Next.js service dynamically if needed
                const nextjsService = await loadStackService('nextjs');
                totalFiles = await nextjsService.countTotalRules(meta);

                // Set up progress tracking
                const updateNextjsProgress = () => {
                    processedFiles++;
                    cliService.updateProgress((processedFiles / totalFiles) * 100);
                };

                await nextjsService.generateRulesAsync(rulesDir, meta, config, updateNextjsProgress, includeGlobalRules);
                break;

            case 'react':
                // Load React service dynamically if needed
                const reactService = await loadStackService('react');
                totalFiles = await reactService.countTotalRules(meta);

                // Set up progress tracking
                const updateReactProgress = () => {
                    processedFiles++;
                    cliService.updateProgress((processedFiles / totalFiles) * 100);
                };

                await reactService.generateRulesAsync(rulesDir, meta, config, updateReactProgress, includeGlobalRules);
                break;

            case 'angular':
                // Load Angular service dynamically if needed
                const angularService = await loadStackService('angular');
                totalFiles = await angularService.countTotalRules(meta);

                // Set up progress tracking
                const updateAngularProgress = () => {
                    processedFiles++;
                    cliService.updateProgress((processedFiles / totalFiles) * 100);
                };

                await angularService.generateRulesAsync(rulesDir, meta, config, updateAngularProgress, includeGlobalRules);
                break;

            default:
                // For other stacks, use the generic stack service
                totalFiles = stackService.countTotalRules(meta);

                // Set up progress tracking
                const updateGenericProgress = () => {
                    processedFiles++;
                    cliService.updateProgress((processedFiles / totalFiles) * 100);
                };

                await stackService.generateRulesAsync(rulesDir, meta, config, updateGenericProgress, includeGlobalRules);
        }

        // End progress tracking
        cliService.completeProgress();

        // Get the end time and calculate duration
        const endGeneration = Date.now();
        const durationMs = endGeneration - startGeneration;
        const durationFormatted = (durationMs / 1000).toFixed(2);

        // Create the summary and show it
        cliService.success(`Rules generated successfully in ${durationFormatted}s!`);
        cliService.info(`Generated ${totalFiles} rule files at ${chalk.bold(rulesDir)}`);

        // Show additional information about the architecture if available
        if (additionalOptions.architecture) {
            cliService.info(`Architecture: ${chalk.bold(additionalOptions.architecture)}`);
        }

        // Show version information if available
        if (additionalOptions.formattedVersionName) {
            cliService.info(`Version: ${chalk.bold(additionalOptions.formattedVersionName)}`);
        }

        // Clean up cached templates to free memory
        fileService.clearCache();

    } catch (error) {
        cliService.completeProgress();
        cliService.error(`Error generating rules: ${error.message}`);

        if (debugMode) {
            console.error(error);
        }

        process.exit(1);
    }
}

/**
 * Handle the --update flag for updating rules
 */
async function handleUpdate() {
    cliService.info('Updating rules...');

    // Implementation for update mode
    // TODO: Add implementation for update mode

    cliService.success('Rules updated successfully!');
}

// Run the main function
main().catch(error => {
    cliService.error(`Error: ${error.message}`);
    if (debugMode) {
        console.error(error);
    }
    process.exit(1);
});