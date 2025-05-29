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
const infoFlag = args.includes('--info');

// Initialize essential services
const baseService = new BaseService({ debug: debugMode });
const configService = new ConfigService({ debug: debugMode, templatesDir });
const fileService = new FileService({ debug: debugMode, templatesDir });
const cliService = new CliService({ debug: debugMode });
const stackService = new StackService({
    debug: debugMode,
    configService,
    fileService,
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

        // Instantiate the service with stackService methods
        const serviceInstance = new ServiceClass({
            debug: debugMode,
            fileService,
            configService,
            templatesDir,
            stackService // Pass stackService to inherit its methods
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
 * Display project information
 */
function showProjectInfo() {
    // Get available stacks dynamically from the service
    const availableStacks = stackService.getAvailableStacks();
    const formattedStacks = availableStacks
        .map(stack => `  - ${stack.charAt(0).toUpperCase() + stack.slice(1)}`)
        .join('\n');

    const infoText = `
${chalk.bold('Agent Rules Kit')} ${chalk.blue(`v${version}`)}

${chalk.green('Description:')}
  Bootstrap Cursor rules (.mdc) for AI agent-guided projects.
  This tool helps you generate and maintain project-specific rules
  for multiple frameworks and architectures.

${chalk.green('Supported Stacks:')}
${formattedStacks}

${chalk.green('Usage:')}
  npx agent-rules-kit            # Interactive mode
  npx agent-rules-kit --update   # Update existing rules
  npx agent-rules-kit --info     # Show this information

${chalk.green('Repository:')}
  https://github.com/tecnomanu/agent-rules-kit

${chalk.green('Author:')}
  Manuel Bruña
`;

    console.log(infoText);
}

/**
 * Main function
 */
async function main() {
    cliService.showBanner(`🚀 Agent Rules Kit v${version}`, true);

    // Handle info flag
    if (infoFlag) {
        showProjectInfo();
        return;
    }

    // Handle update flag
    if (updateFlag) {
        await handleUpdate();
        return;
    }

    // Welcome and introduction
    cliService.showWelcome();

    // Wait for user to press enter to continue
    await cliService.askContinue();

    // Ask for the relative path to the project first
    const projectPath = await cliService.askProjectPath();

    // Ask for the application directory within the project
    const appDirectory = await cliService.askAppDirectory();

    // Format the rules directory path - always in .cursor/rules/rules-kit
    const rulesDir = stackService.formatRulesPath(projectPath);

    // Initialize variables for collection user choices
    let selectedStack = null;
    let additionalOptions = {};
    let includeGlobalRules = false;

    // First question: Do you want rules for a specific stack?
    const { wantStack } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'wantStack',
            message: `${cliService.emoji.stack} Do you want to install rules for a specific stack?`,
            default: true
        }
    ]);

    if (wantStack) {
        // Get available stacks from the service
        const availableStacks = stackService.getAvailableStacks().map(stack => ({
            name: stack.charAt(0).toUpperCase() + stack.slice(1), // Capitalize first letter
            value: stack
        }));

        if (availableStacks.length === 0) {
            cliService.error('No stacks found in kit-config.json or stacks directory');
            process.exit(1);
        }

        // Ask for the stack to use
        selectedStack = await cliService.askStack(availableStacks);

        // Try to detect the stack version
        const detectedVersion = stackService.detectStackVersion(selectedStack, appDirectory !== './' ? appDirectory : projectPath);
        if (detectedVersion) {
            cliService.info(`Detected ${selectedStack} version: ${detectedVersion}`);
        }

        // Load the appropriate stack service dynamically
        const stackSpecificService = await loadStackService(selectedStack);

        // Stack-specific questions
        if (selectedStack === 'laravel') {
            // Get available architectures for Laravel
            const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
            const architecture = await cliService.askArchitecture(architectures, selectedStack);

            // Get available versions for Laravel
            const versions = stackSpecificService.getAvailableVersions(selectedStack);
            const version = await cliService.askVersion(versions, detectedVersion);

            // Map specific version to version range if needed
            const versionRange = stackSpecificService.mapVersionToRange(selectedStack, version);

            // Get formatted version name for display
            const formattedVersionName = stackSpecificService.getFormattedVersionName(selectedStack, version);

            additionalOptions = {
                architecture,
                detectedVersion: version,
                versionRange,
                formattedVersionName
            };
        }
        else if (selectedStack === 'nextjs') {
            // Get available architectures for Next.js
            const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
            const architecture = await cliService.askArchitecture(architectures, selectedStack);

            // Get available versions for Next.js
            const versions = stackSpecificService.getAvailableVersions(selectedStack);
            const version = await cliService.askVersion(versions, detectedVersion);

            // Map specific version to version range if needed
            const versionRange = stackSpecificService.mapVersionToRange(selectedStack, version);

            // Get formatted version name for display
            const formattedVersionName = stackSpecificService.getFormattedVersionName(selectedStack, version);

            additionalOptions = {
                architecture,
                detectedVersion: version,
                versionRange,
                formattedVersionName
            };
        }
        else if (selectedStack === 'react') {
            // Get available architectures for React
            const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
            const architecture = await cliService.askArchitecture(architectures, selectedStack);

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
            const versions = stackSpecificService.getAvailableVersions(selectedStack);
            const version = await cliService.askVersion(versions, detectedVersion);

            // Map specific version to version range if needed
            const versionRange = stackSpecificService.mapVersionToRange(selectedStack, version);

            // Get formatted version name for display
            const formattedVersionName = stackSpecificService.getFormattedVersionName(selectedStack, version);

            additionalOptions = {
                architecture,
                stateManagement,
                detectedVersion: version,
                versionRange,
                formattedVersionName
            };
        }
        else if (selectedStack === 'angular') {
            // Get available architectures for Angular
            const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
            const architecture = await cliService.askArchitecture(architectures, selectedStack);

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
            const versions = stackSpecificService.getAvailableVersions(selectedStack);
            const version = await cliService.askVersion(versions, detectedVersion);

            // Map specific version to version range if needed
            const versionRange = stackSpecificService.mapVersionToRange(selectedStack, version);

            // Get formatted version name for display
            const formattedVersionName = stackSpecificService.getFormattedVersionName(selectedStack, version);

            additionalOptions = {
                architecture,
                includeSignals,
                detectedVersion: version,
                versionRange,
                formattedVersionName
            };
        } else {
            // For other stacks, fetch available versions and architectures when available
            const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
            if (architectures.length > 0) {
                additionalOptions.architecture = await cliService.askArchitecture(architectures, selectedStack);
            }

            const versions = stackSpecificService.getAvailableVersions(selectedStack);
            if (versions.length > 0) {
                const version = await cliService.askVersion(versions, detectedVersion);
                const versionRange = stackSpecificService.mapVersionToRange(selectedStack, version);
                const formattedVersionName = stackSpecificService.getFormattedVersionName(selectedStack, version);

                additionalOptions = {
                    ...additionalOptions,
                    detectedVersion: version,
                    versionRange,
                    formattedVersionName
                };
            }
        }
    }

    // Second question: Do you want global rules?
    const { wantGlobalRules } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'wantGlobalRules',
            message: `${cliService.emoji.global} Do you want to include global best practice rules?`,
            default: true
        }
    ]);

    includeGlobalRules = wantGlobalRules;

    // If no stack and no global rules, exit
    if (!selectedStack && !includeGlobalRules) {
        cliService.info('💭 No rules selected for installation. See you later!');
        process.exit(0);
    }

    // Check if rules directory already exists and create backup if needed
    if (await baseService.directoryExistsAsync(rulesDir)) {
        const action = await cliService.askDirectoryAction(rulesDir);

        if (action === 'cancel') {
            cliService.info('❌ Operation canceled by user');
            process.exit(0);
        }

        if (action === 'backup') {
            const backupDir = await stackService.createBackupAsync(rulesDir);
            if (backupDir) {
                cliService.backupCreated(rulesDir, backupDir);
            }
        }
    }

    // Ensure the rules directory exists
    await baseService.ensureDirectoryExistsAsync(rulesDir);

    // Show installation summary
    cliService.showInstallationSummary(selectedStack, includeGlobalRules, additionalOptions);

    // Get the start time for measuring performance
    const startGeneration = Date.now();

    // Generate rules with progress tracking
    cliService.startProgress('Generating rules');

    // Prepare metadata for rule generation
    const meta = {
        projectPath: appDirectory,
        cursorPath: projectPath,
        stack: selectedStack,
        debug: debugMode,
        ...additionalOptions
    };

    // Load config only once to improve performance
    const config = configService.getConfig();

    try {
        let totalFiles = 0;

        // If global rules are requested, copy them
        if (includeGlobalRules) {
            const globalMeta = {
                projectPath: appDirectory,
                cursorPath: projectPath,
                debug: debugMode
            };

            const globalCount = await stackService.copyGlobalRules(rulesDir, globalMeta, config);
            totalFiles += globalCount;
        }

        // If stack is selected, generate stack-specific rules
        if (selectedStack) {
            const stackCount = await stackService.countStackRules(meta);
            totalFiles += stackCount;

            // Generate stack-specific rules only (global rules already copied)
            await stackService.generateRulesAsync(rulesDir, meta, config, () => { }, false);
        }

        // End progress tracking
        cliService.completeProgress();

        // Get the end time and calculate duration
        const endGeneration = Date.now();
        const durationMs = endGeneration - startGeneration;
        const durationFormatted = (durationMs / 1000).toFixed(2);

        // Show success message
        cliService.showSuccess(totalFiles, rulesDir, durationFormatted, selectedStack, additionalOptions);

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