/**
 * CLI Service for Agent Rules Kit
 * Handles command line interface and message formatting
 */
import chalk from 'chalk';
import cliProgress from 'cli-progress';
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
            global: '🌐',
            progress: '🔨',
            folder: '📁'
        };
        this.progressBar = null;
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
     * Starts a progress bar with the given title
     * @param {string} title - Title for the progress operation
     * @param {Object} options - Options for the progress bar
     */
    startProgress(title, options = {}) {
        // Ensure any existing progress bar is stopped
        this.completeProgress();

        // Create a new progress bar
        this.progressBar = new cliProgress.SingleBar({
            format: `${this.emoji.progress} ${title} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total} files`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true,
            clearOnComplete: false,
            ...options
        });

        // Start with 0/100 as default if not specified
        const total = options.total || 100;
        this.progressBar.start(total, 0);
    }

    /**
     * Updates the progress bar
     * @param {number} value - Current progress value (percentage if between 0-100)
     * @param {Object} payload - Additional data for the progress bar
     */
    updateProgress(value, payload = {}) {
        if (!this.progressBar) return;

        // If value is percentage between 0-100, convert to actual value
        if (value <= 100 && value >= 0) {
            const total = this.progressBar.getTotal();
            value = Math.floor((value / 100) * total);
        }

        this.progressBar.update(value, payload);
    }

    /**
     * Completes and clears the progress bar
     */
    completeProgress() {
        if (this.progressBar) {
            this.progressBar.stop();
            this.progressBar = null;
            console.log(); // Add an empty line after the progress bar
        }
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
                choices: [
                    ...availableStacks,
                    { name: '← Continue without specific stack', value: null }
                ],
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
     * Shows a notification that a backup was created
     * @param {string} originalDir - Original directory path
     * @param {string} backupDir - Backup directory path
     */
    backupCreated(originalDir, backupDir) {
        this.success(`Created backup of ${chalk.blue(originalDir)} at ${chalk.green(backupDir)}`);
    }

    /**
     * Asks for the path to the application directory within the project
     * @returns {Promise<string>} The app directory
     */
    async askAppDirectory() {
        const { appDirectory } = await inquirer.prompt([
            {
                type: 'input',
                name: 'appDirectory',
                message: `${this.emoji.folder} Directory of your application (from project root):`,
                default: '.',
                validate: input => {
                    if (!input.trim()) {
                        return 'Directory cannot be empty';
                    }
                    return true;
                }
            }
        ]);

        // If user enters empty or just '.', return './'
        return appDirectory.trim() === '' || appDirectory.trim() === '.' ? './' : appDirectory.trim();
    }

    /**
     * Shows welcome message and introduction
     */
    showWelcome() {
        console.log(chalk.bold.cyan('✨ Welcome to Agent Rules Kit! ✨\n'));
        console.log(chalk.white('This tool will help you install best practice rules'));
        console.log(chalk.white('for your project with artificial intelligence.\n'));

        console.log(chalk.green('📝 What we will do:'));
        console.log(chalk.white('  • Configure specific rules for your development stack'));
        console.log(chalk.white('  • Include global industry best practices'));
        console.log(chalk.white('  • Preserve your existing rules and backups for existing `agent rules kit`\n'));

        console.log(chalk.yellow('⚡ Rules will be installed in:'));
        console.log(chalk.white('  📁 [your_specific_path]/.cursor/rules/rules-kit/\n'));

        console.log(chalk.magenta('🎯 We will ask you a few quick questions to customize the installation.'));
    }

    /**
     * Asks user to press enter to continue
     */
    async askContinue() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: chalk.bold('👉 Press ENTER to continue...'),
                default: ''
            }
        ]);
        console.log(); // Add spacing
    }

    /**
     * Shows installation summary before proceeding
     * @param {string} selectedStack - Selected stack
     * @param {boolean} includeGlobalRules - Whether to include global rules
     * @param {object} additionalOptions - Additional configuration options
     */
    showInstallationSummary(selectedStack, includeGlobalRules, additionalOptions) {
        console.log(chalk.bold.cyan('\n📋 Installation Summary:\n'));

        if (includeGlobalRules) {
            console.log(chalk.green('✅ Global rules: Yes (universal best practices)'));
        } else {
            console.log(chalk.gray('❌ Global rules: No'));
        }

        if (selectedStack) {
            console.log(chalk.green(`✅ Specific stack: ${selectedStack.charAt(0).toUpperCase() + selectedStack.slice(1)}`));

            if (additionalOptions.architecture) {
                console.log(chalk.white(`   📐 Architecture: ${additionalOptions.architecture}`));
            }

            if (additionalOptions.formattedVersionName) {
                console.log(chalk.white(`   🏷️  Version: ${additionalOptions.formattedVersionName}`));
            }

            if (additionalOptions.stateManagement) {
                console.log(chalk.white(`   🔄 State Management: ${additionalOptions.stateManagement}`));
            }

            if (additionalOptions.includeSignals !== undefined) {
                console.log(chalk.white(`   ⚡ Angular Signals: ${additionalOptions.includeSignals ? 'Yes' : 'No'}`));
            }
        } else {
            console.log(chalk.gray('❌ Specific stack: No'));
        }

        console.log(); // Add spacing
    }

    /**
     * Shows success message with complete installation details
     * @param {number} totalFiles - Total files generated
     * @param {string} rulesDir - Rules directory path
     * @param {string} duration - Duration in seconds
     * @param {string} selectedStack - Selected stack
     * @param {object} additionalOptions - Additional configuration options
     */
    showSuccess(totalFiles, rulesDir, duration, selectedStack, additionalOptions) {
        console.log(chalk.bold.green('\n🎉 Installation completed successfully!\n'));

        console.log(chalk.white(`📊 Files generated: ${chalk.bold(totalFiles)}`));
        console.log(chalk.white(`📁 Location: ${chalk.bold(rulesDir)}`));
        console.log(chalk.white(`⏱️  Time: ${chalk.bold(duration)}s\n`));

        if (selectedStack) {
            console.log(chalk.cyan(`🚀 Stack configured: ${chalk.bold(selectedStack.charAt(0).toUpperCase() + selectedStack.slice(1))}`));

            if (additionalOptions.architecture) {
                console.log(chalk.white(`   📐 Architecture: ${additionalOptions.architecture}`));
            }

            if (additionalOptions.formattedVersionName) {
                console.log(chalk.white(`   🏷️  Version: ${additionalOptions.formattedVersionName}`));
            }
        }

        console.log(chalk.bold.yellow('\n📚 Next steps:'));
        console.log(chalk.white('  1. Rules are now active in your project'));
        console.log(chalk.white('  2. Cursor AI will use these rules automatically'));
        console.log(chalk.white('  3. You can edit rules in .cursor/rules/rules-kit/'));
        console.log(chalk.white('  4. To update, run: npx agent-rules-kit --update\n'));

        console.log(chalk.bold.green('✨ Happy coding! ✨\n'));
    }
} 