/**
 * CLI Service for Agent Rules Kit
 * Handles command line interface and message formatting
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { BaseService } from './base-service.js';

/**
 * Service for handling the command line interface
 */
export class CliService extends BaseService {
    constructor(options = {}) {
        super(options);
        // Initialize with defaults for emojis and colors
        this.emoji = {
            info: '📌',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            processing: '🔄',
            stack: '📚',
            version: '🏷️',
            architecture: '🏗️',
            config: '⚙️',
            backup: '📦',
            file: '📄',
            global: '🌐'
        };
    }

    /**
     * Shows a banner message
     * @param {string} message - Message to display
     * @param {boolean} clear - Whether to clear the console first
     */
    showBanner(message, clear = false) {
        if (clear) console.clear();
        console.log(chalk.bold.blue('\n' + '='.repeat(message.length + 10)));
        console.log(chalk.bold.blue('     ' + message + '     '));
        console.log(chalk.bold.blue('='.repeat(message.length + 10) + '\n'));
    }

    /**
     * Shows an informational message
     * @param {string} message - Message to display
     */
    info(message) {
        console.log(`${chalk.blue(this.emoji.info)} ${message}`);
    }

    /**
     * Shows a success message
     * @param {string} message - Message to display
     */
    success(message) {
        console.log(`${chalk.green(this.emoji.success)} ${message}`);
    }

    /**
     * Shows a warning message
     * @param {string} message - Message to display
     */
    warning(message) {
        console.log(`${chalk.yellow(this.emoji.warning)} ${chalk.yellow(message)}`);
    }

    /**
     * Shows an error message
     * @param {string} message - Message to display
     */
    error(message) {
        console.log(`${chalk.red(this.emoji.error)} ${chalk.red(message)}`);
    }

    /**
     * Shows a processing message
     * @param {string} message - Message to display
     */
    processing(message) {
        console.log(`${chalk.blue(this.emoji.processing)} ${message}`);
    }

    /**
     * Asks the user about the stack to use
     * @param {Array<string>} availableStacks - Available stacks
     * @returns {Promise<string>} The selected stack
     */
    async askStack(availableStacks) {
        const { stack } = await inquirer.prompt([
            {
                type: 'list',
                name: 'stack',
                message: `${this.emoji.stack} Select the stack for your rules:`,
                choices: availableStacks,
            }
        ]);
        return stack;
    }

    /**
     * Asks the user about the architecture to use
     * @param {Array<string>} availableArchitectures - Available architectures
     * @param {string} stack - Selected stack
     * @returns {Promise<string>} The selected architecture
     */
    async askArchitecture(availableArchitectures, stack) {
        if (!availableArchitectures || availableArchitectures.length === 0) {
            return null;
        }

        const { architecture } = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: `${this.emoji.architecture} Select architecture for ${stack}:`,
                choices: [...availableArchitectures, { name: 'Do not specify architecture', value: null }]
            }
        ]);
        return architecture;
    }

    /**
     * Asks the user about the state management to use (React)
     * @param {Array<string>} availableStateManagement - Available state management options
     * @returns {Promise<string>} The selected state management
     */
    async askStateManagement(availableStateManagement) {
        if (!availableStateManagement || availableStateManagement.length === 0) {
            return null;
        }

        const { stateManagement } = await inquirer.prompt([
            {
                type: 'list',
                name: 'stateManagement',
                message: `${this.emoji.config} Select state management for React:`,
                choices: [...availableStateManagement, { name: 'Do not specify state management', value: null }]
            }
        ]);
        return stateManagement;
    }

    /**
     * Asks the user about the version to use
     * @param {Array<string>} availableVersions - Available versions
     * @param {string} detectedVersion - Detected version
     * @returns {Promise<string>} The selected version
     */
    async askVersion(availableVersions, detectedVersion) {
        let message = `${this.emoji.version} Select version:`;

        if (detectedVersion) {
            message = `${this.emoji.version} Detected version: ${detectedVersion}. Do you want to use another one?`;
        }

        const { version } = await inquirer.prompt([
            {
                type: 'list',
                name: 'version',
                message,
                choices: [
                    ...(detectedVersion ? [{ name: `Use detected version (${detectedVersion})`, value: detectedVersion }] : []),
                    ...availableVersions.map(v => ({ name: v.name, value: v.value })),
                    { name: 'Do not specify version', value: null }
                ]
            }
        ]);
        return version;
    }

    /**
     * Asks the user for the relative path of the project
     * @returns {Promise<string>} The relative path of the project
     */
    async askProjectPath() {
        const { projectPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectPath',
                message: `${this.emoji.file} Relative path to your project (if not in the root) from .cursor directory:`,
                default: '.'
            }
        ]);
        return projectPath;
    }

    /**
     * Asks the user if they want to include global rules
     * @returns {Promise<boolean>} true if global rules should be included
     */
    async askIncludeGlobalRules() {
        const { includeGlobal } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'includeGlobal',
                message: `${this.emoji.global} Include global best-practice rules?`,
                default: true
            }
        ]);
        return includeGlobal;
    }

    /**
     * Asks the user if they want to enable debug mode
     * @returns {Promise<boolean>} true if debug mode is enabled
     */
    async askDebugMode() {
        const { debug } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'debug',
                message: `${this.emoji.config} Enable debug mode?`,
                default: false
            }
        ]);
        return debug;
    }

    /**
     * Asks the user what to do when a directory exists
     * @param {string} dirName - Directory name
     * @returns {Promise<string>} The selected action (backup/replace/cancel)
     */
    async askDirectoryAction(dirName) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: `${this.emoji.warning} The directory ${chalk.yellow(dirName)} already exists. What would you like to do?`,
                choices: [
                    { name: 'Create backup before continuing', value: 'backup' },
                    { name: 'Replace existing files (no backup)', value: 'replace' },
                    { name: 'Cancel operation', value: 'cancel' }
                ],
                default: 'backup'
            }
        ]);
        return action;
    }

    /**
     * Asks the user to confirm all options before processing
     * @param {Object} options - All the collected options
     * @returns {Promise<boolean>} true if the user wants to proceed
     */
    async confirmOptions(options) {
        // Format options for display
        const formattedOptions = [
            `${this.emoji.stack} Stack: ${chalk.blue(options.stack)}`,
            `${this.emoji.architecture} Architecture: ${chalk.blue(options.architecture || 'Not specified')}`,
            `${this.emoji.version} Version: ${chalk.blue(options.versionRange || 'Not specified')}`,
            `${this.emoji.file} Project path: ${chalk.blue(options.projectPath)}`,
            `${this.emoji.global} Include global rules: ${chalk.blue(options.includeGlobal ? 'Yes' : 'No')}`
        ];

        // Add state management if it's for React
        if (options.stack === 'react' && options.stateManagement) {
            formattedOptions.push(`${this.emoji.config} State management: ${chalk.blue(options.stateManagement)}`);
        }

        // Display all options
        console.log(chalk.bold('\nConfiguration summary:'));
        formattedOptions.forEach(option => console.log(option));

        // Ask for confirmation
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Proceed with these settings?',
                default: true
            }
        ]);

        return confirm;
    }

    /**
     * Informs about the creation of a backup
     * @param {string} originalDir - Original directory
     * @param {string} backupDir - Backup directory
     */
    backupCreated(originalDir, backupDir) {
        this.info(`${this.emoji.backup} Backup created: ${chalk.green(originalDir)} → ${chalk.green(backupDir)}`);
    }
} 