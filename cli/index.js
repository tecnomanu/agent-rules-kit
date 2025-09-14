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
import { McpService } from './services/mcp/mcp-service.js';
import { StackService } from './services/stack-service.js';

// Path configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

// Parse command line arguments
const args = process.argv.slice(2);

function parseCliArgs(argv) {
    const opts = {
        debug: argv.includes('--debug'),
        update: argv.includes('--update'),
        info: argv.includes('--info'),
        global: null,
        stack: null,
        architecture: null,
        version: null,
        projectPath: null,
        appDirectory: null,
        cursorPath: null,
        mcpTools: [],
        stateManagement: null,
        includeSignals: null,
        autoInstall: argv.includes('--auto-install') || argv.includes('--auto'),
        ide: null
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--no-global') {
            opts.global = false;
            continue;
        }
        if (arg === '--global') {
            opts.global = true;
            continue;
        }
        if (arg.startsWith('--stack=')) {
            opts.stack = arg.split('=')[1];
            continue;
        }
        if (arg === '--stack' && i + 1 < argv.length) {
            opts.stack = argv[++i];
            continue;
        }
        if (arg.startsWith('--architecture=')) {
            opts.architecture = arg.split('=')[1];
            continue;
        }
        if (arg === '--architecture' && i + 1 < argv.length) {
            opts.architecture = argv[++i];
            continue;
        }
        if (arg.startsWith('--version=')) {
            opts.version = arg.split('=')[1];
            continue;
        }
        if (arg === '--version' && i + 1 < argv.length) {
            opts.version = argv[++i];
            continue;
        }
        if (arg.startsWith('--project-path=')) {
            opts.projectPath = arg.split('=')[1];
            continue;
        }
        if (arg === '--project-path' && i + 1 < argv.length) {
            opts.projectPath = argv[++i];
            continue;
        }
        if (arg.startsWith('--cursor-path=')) {
            opts.cursorPath = arg.split('=')[1];
            continue;
        }
        if (arg === '--cursor-path' && i + 1 < argv.length) {
            opts.cursorPath = argv[++i];
            continue;
        }
        if (arg.startsWith('--app-directory=')) {
            opts.appDirectory = arg.split('=')[1];
            continue;
        }
        if (arg === '--app-directory' && i + 1 < argv.length) {
            opts.appDirectory = argv[++i];
            continue;
        }
        if (arg.startsWith('--mcp-tools=')) {
            const val = arg.split('=')[1];
            opts.mcpTools = val.split(',').map(v => v.trim()).filter(Boolean);
            continue;
        }
        if (arg.startsWith('--state-management=')) {
            opts.stateManagement = arg.split('=')[1];
            continue;
        }
        if (arg === '--state-management' && i + 1 < argv.length) {
            opts.stateManagement = argv[++i];
            continue;
        }
        if (arg === '--include-signals') {
            opts.includeSignals = true;
            continue;
        }
        if (arg === '--no-signals') {
            opts.includeSignals = false;
            continue;
        }
        if (arg.startsWith('--ide=')) {
            opts.ide = arg.split('=')[1];
            continue;
        }
        if (arg === '--ide' && i + 1 < argv.length) {
            opts.ide = argv[++i];
            continue;
        }
    }

    return opts;
}

const cliOptions = parseCliArgs(args);
const debugMode = cliOptions.debug;
const updateFlag = cliOptions.update;
const infoFlag = cliOptions.info;

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
const mcpService = new McpService({
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
        // Try to dynamically import the required service
        const servicePath = `./services/stack/${stack}-service.js`;

        try {
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

            baseService.debugLog(`Loaded specific service for ${stack}`);
            return serviceInstance;
        } catch (importError) {
            // If specific service doesn't exist, fall back to base StackService
            baseService.debugLog(`No specific service found for ${stack}, using base StackService`);

            // Cache the base stackService for this stack
            stackServices.set(stack, stackService);
            return stackService;
        }
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
 * IDE configurations for different targets
 */
const IDE_CONFIGS = {
    cursor: {
        name: 'Cursor',
        multiple: true,
        dir: '.cursor/rules/rules-kit',
        extension: '.mdc',
        keepFrontMatter: true
    },
    vscode: {
        name: 'VS Code / GitHub Copilot',
        multiple: false,
        file: '.github/copilot-instructions.md',
        extension: '.md',
        keepFrontMatter: false
    },
    windsurf: {
        name: 'Windsurf',
        multiple: true,
        dir: '.windsurf/rules',
        extension: '.md',
        keepFrontMatter: false
    },
    continue: {
        name: 'Continue',
        multiple: true,
        dir: '.continue/rules',
        extension: '.md',
        keepFrontMatter: true
    },
    zed: {
        name: 'Zed',
        multiple: false,
        file: '.rules',
        extension: '.rules',
        keepFrontMatter: false
    },
    claude: {
        name: 'Claude Code',
        multiple: false,
        file: 'CLAUDE.md',
        extension: '.md',
        keepFrontMatter: false
    },
    gemini: {
        name: 'Gemini Code',
        multiple: false,
        file: 'GEMINI.md',
        extension: '.md',
        keepFrontMatter: false
    },
    codex: {
        name: 'OpenAI Codex',
        multiple: false,
        file: 'AGENTS.md',
        extension: '.md',
        keepFrontMatter: false
    },
    cline: {
        name: 'Cline',
        multiple: false,
        file: '.clinerules',
        extension: '.md',
        keepFrontMatter: false
    }
};

/**
 * Format rules directory path based on selected IDE
 * @param {string} ide - Selected IDE
 * @param {string} projectPath - Project path
 * @returns {string} - Rules directory path
 */
function formatRulesDirForIde(ide, projectPath) {
    const config = IDE_CONFIGS[ide];
    if (!config) {
        throw new Error(`Unknown IDE: ${ide}`);
    }

    if (config.multiple) {
        return path.join(projectPath, config.dir);
    } else {
        return path.join(projectPath, path.dirname(config.file));
    }
}

/**
 * Display comprehensive project information
 */
function showProjectInfo() {
    // Get available stacks dynamically from the service
    const availableStacks = stackService.getAvailableStacks();
    const config = configService.loadKitConfig(templatesDir);

    // Get available MCP tools
    const mcpTools = mcpService.getAvailableMcpTools();

    console.log(`\n${chalk.bold('Agent Rules Kit')} ${chalk.blue(`v${version}`)}`);
    console.log('='.repeat(50));

    console.log(`\n${chalk.green('📝 Description:')}`);
    console.log('  Bootstrap Cursor rules (.mdc) for AI agent-guided projects.');
    console.log('  This tool helps you generate and maintain project-specific rules');
    console.log('  for multiple frameworks and architectures.');

    // Show supported stacks with versions and architectures
    console.log(`\n${chalk.green('📚 Supported Stacks:')} (${availableStacks.length} total)`);
    availableStacks.forEach(stack => {
        const stackConfig = config[stack] || {};
        const versions = stackConfig.version_ranges ? Object.keys(stackConfig.version_ranges) : [];
        const architectures = stackService.getAvailableArchitectures(stack);

        console.log(`\n  ${chalk.bold(stack.toUpperCase())}`);

        if (versions.length > 0) {
            console.log(`    🏷️  Versions: ${versions.join(', ')}`);
        }

        if (architectures.length > 0) {
            const archNames = architectures.map(arch => arch.value).join(', ');
            console.log(`    🏗️  Architectures: ${archNames}`);
            if (stackConfig.default_architecture) {
                console.log(`    ⭐ Default: ${stackConfig.default_architecture}`);
            }
        }
    });

    // Show supported MCP tools
    console.log(`\n${chalk.green('🔧 MCP Tools:')} (${mcpTools.length} available)`);
    mcpTools.forEach(tool => {
        console.log(`  • ${chalk.bold(tool.name)}`);
        console.log(`    ${tool.description}`);
    });

    // Show supported IDEs
    console.log(`\n${chalk.green('🎯 Supported IDEs:')} (${Object.keys(IDE_CONFIGS).length} targets)`);
    Object.entries(IDE_CONFIGS).forEach(([key, config]) => {
        const formatInfo = config.multiple
            ? `Multiple files in ${config.dir}`
            : `Single file: ${config.file}`;
        console.log(`  • ${chalk.bold(config.name)} (${key}): ${formatInfo}`);
    });

    console.log(`\n${chalk.green('💡 Usage Examples:')}`);
    console.log('  npx agent-rules-kit                    # Interactive mode');
    console.log('  npx agent-rules-kit --info              # Show this information');
    console.log('  npx agent-rules-kit --update            # Update existing rules');
    console.log('  npx agent-rules-kit --stack=laravel     # Direct stack installation');
    console.log('  npx agent-rules-kit --ide=vscode        # Target specific IDE');
    console.log('  npx agent-rules-kit --global --auto     # Global rules only');

    console.log(`\n${chalk.green('🔗 Links:')}`);
    console.log('  Repository: https://github.com/tecnomanu/agent-rules-kit');
    console.log('  Documentation: https://github.com/tecnomanu/agent-rules-kit/blob/main/README.md');
    console.log('  Agent Guide: https://github.com/tecnomanu/agent-rules-kit/blob/main/AGENTS.md');

    console.log(`\n${chalk.green('👨‍💻 Author:')}`);
    console.log('  Manuel Bruña');

    console.log('\n' + '='.repeat(50));
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

    // Wait for user to press enter to continue unless auto-install
    if (!cliOptions.autoInstall) {
        await cliService.askContinue();
    }

    // Ask for IDE selection FIRST (or use CLI option)
    let selectedIde = cliOptions.ide;
    if (!selectedIde) {
        if (cliOptions.autoInstall) {
            selectedIde = 'cursor'; // Default to Cursor in auto-install
        } else {
            const { ide } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'ide',
                    message: `${cliService.emoji.config} Select IDE/Agent for rules installation:`,
                    choices: [
                        { name: 'Cursor', value: 'cursor' },
                        { name: 'VS Code / GitHub Copilot', value: 'vscode' },
                        { name: 'Windsurf', value: 'windsurf' },
                        { name: 'Continue', value: 'continue' },
                        { name: 'Zed', value: 'zed' },
                        { name: 'Claude Code', value: 'claude' },
                        { name: 'Gemini Code', value: 'gemini' },
                        { name: 'OpenAI Codex', value: 'codex' },
                        { name: 'Cline', value: 'cline' }
                    ],
                    default: 'cursor'
                }
            ]);
            selectedIde = ide;
        }
    }

    // Get IDE configuration to adapt path questions
    const selectedIdeConfig = IDE_CONFIGS[selectedIde];

    // Ask for the relative path to the project (or use CLI option)
    // Adapt the question based on the selected IDE
    const projectPath = cliOptions.projectPath
        ? cliOptions.projectPath
        : cliOptions.autoInstall
            ? '.'
            : await cliService.askProjectPath(selectedIde, selectedIdeConfig);

    // Ask for the application directory within the project (or use CLI option)
    const appDirectory = cliOptions.appDirectory
        ? cliOptions.appDirectory
        : cliOptions.autoInstall
            ? '.'
            : await cliService.askAppDirectory();

    // Format the rules directory path based on selected IDE
    const rulesDir = formatRulesDirForIde(selectedIde, projectPath);

    // Initialize variables for collection user choices
    let selectedStack = null;
    let additionalOptions = {};
    let includeGlobalRules = false;

    // First question: Do you want rules for a specific stack?
    let wantStack = true;
    if (!cliOptions.stack) {
        if (cliOptions.autoInstall) {
            wantStack = false;
        } else {
            const resp = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'wantStack',
                    message: `${cliService.emoji.stack} Do you want to install rules for a specific stack?`,
                    default: true
                }
            ]);
            wantStack = resp.wantStack;
        }
    }

    if (wantStack) {
        // Get available stacks from the service
        const availableStacks = stackService.getAvailableStacks().map(stack => ({
            name: stack.charAt(0).toUpperCase() + stack.slice(1),
            value: stack
        }));

        if (availableStacks.length === 0) {
            cliService.error('No stacks found in kit-config.json or stacks directory');
            process.exit(1);
        }

        if (cliOptions.stack) {
            selectedStack = cliOptions.stack;
        } else {
            // Ask for the stack to use
            selectedStack = await cliService.askStack(availableStacks);
        }

        // If user chose to continue without stack, selectedStack will be null
        if (selectedStack === null) {
            cliService.info('📝 Continuing without specific stack selection...');
        } else {
            // Try to detect the stack version
            let detectedVersion = cliOptions.version || stackService.detectStackVersion(selectedStack, appDirectory !== './' ? appDirectory : projectPath);
            if (!cliOptions.version && detectedVersion) {
                cliService.info(`Detected ${selectedStack} version: ${detectedVersion}`);
            }

            // Load the appropriate stack service dynamically
            const stackSpecificService = await loadStackService(selectedStack);

            // Stack-specific questions
            if (selectedStack === 'laravel') {
                // Get available architectures for Laravel
                const architectures = stackSpecificService.getAvailableArchitectures(selectedStack);
                const architecture = cliOptions.architecture ||
                    (cliOptions.autoInstall ? architectures[0].value : await cliService.askArchitecture(architectures, selectedStack));

                // Get available versions for Laravel
                const versions = stackSpecificService.getAvailableVersions(selectedStack);
                let version;
                if (cliOptions.version) {
                    version = cliOptions.version;
                } else if (cliOptions.autoInstall) {
                    version = detectedVersion || versions[0].value;
                } else {
                    version = await cliService.askVersion(versions, detectedVersion);
                }

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
                const architecture = cliOptions.architecture ||
                    (cliOptions.autoInstall ? architectures[0].value : await cliService.askArchitecture(architectures, selectedStack));

                // Get available versions for Next.js
                const versions = stackSpecificService.getAvailableVersions(selectedStack);
                let version;
                if (cliOptions.version) {
                    version = cliOptions.version;
                } else if (cliOptions.autoInstall) {
                    version = detectedVersion || versions[0].value;
                } else {
                    version = await cliService.askVersion(versions, detectedVersion);
                }

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
                const architecture = cliOptions.architecture ||
                    (cliOptions.autoInstall ? architectures[0].value : await cliService.askArchitecture(architectures, selectedStack));

                // Get available state management options
                const stateManagementOptions = [
                    'redux',
                    'redux-toolkit',
                    'context',
                    'react-query',
                    'zustand'
                ];
                const stateManagement = cliOptions.stateManagement ||
                    (cliOptions.autoInstall ? stateManagementOptions[0] : await cliService.askStateManagement(stateManagementOptions));

                // Get available versions for React
                const versions = stackSpecificService.getAvailableVersions(selectedStack);
                let version;
                if (cliOptions.version) {
                    version = cliOptions.version;
                } else if (cliOptions.autoInstall) {
                    version = detectedVersion || versions[0].value;
                } else {
                    version = await cliService.askVersion(versions, detectedVersion);
                }

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
                const architecture = cliOptions.architecture ||
                    (cliOptions.autoInstall ? architectures[0].value : await cliService.askArchitecture(architectures, selectedStack));

                // Ask if Angular signals should be included
                let includeSignals;
                if (cliOptions.includeSignals !== null) {
                    includeSignals = cliOptions.includeSignals;
                } else if (cliOptions.autoInstall) {
                    includeSignals = true;
                } else {
                    const resp = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'includeSignals',
                            message: `${cliService.emoji.config} Include Angular Signals rules?`,
                            default: true
                        }
                    ]);
                    includeSignals = resp.includeSignals;
                }

                // Get available versions for Angular
                const versions = stackSpecificService.getAvailableVersions(selectedStack);
                let version;
                if (cliOptions.version) {
                    version = cliOptions.version;
                } else if (cliOptions.autoInstall) {
                    version = detectedVersion || versions[0].value;
                } else {
                    version = await cliService.askVersion(versions, detectedVersion);
                }

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
                    additionalOptions.architecture = cliOptions.architecture ||
                        (cliOptions.autoInstall ? architectures[0].value : await cliService.askArchitecture(architectures, selectedStack));
                }

                const versions = stackSpecificService.getAvailableVersions(selectedStack);
                if (versions.length > 0) {
                    let version;
                    if (cliOptions.version) {
                        version = cliOptions.version;
                    } else if (cliOptions.autoInstall) {
                        version = detectedVersion || versions[0].value;
                    } else {
                        version = await cliService.askVersion(versions, detectedVersion);
                    }
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
    }

    // Second question: Do you want global rules?
    if (cliOptions.global !== null) {
        includeGlobalRules = cliOptions.global;
    } else if (cliOptions.autoInstall) {
        includeGlobalRules = true;
    } else {
        const { wantGlobalRules } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'wantGlobalRules',
                message: `${cliService.emoji.global} Do you want to include global best practice rules?`,
                default: true
            }
        ]);

        includeGlobalRules = wantGlobalRules;
    }

    // Third question: Do you want MCP tools rules?
    let selectedMcpTools = [];
    let wantMcpTools = cliOptions.mcpTools.length > 0 ? true : null;
    if (wantMcpTools === null) {
        if (cliOptions.autoInstall) {
            wantMcpTools = true;
        } else {
            const resp = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'wantMcpTools',
                    message: `${cliService.emoji.tools} Do you want to install MCP (Model Context Protocol) tools rules?`,
                    default: false
                }
            ]);
            wantMcpTools = resp.wantMcpTools;
        }
    }

    if (wantMcpTools) {
        const availableMcpTools = mcpService.getAvailableMcpTools();

        if (availableMcpTools.length > 0) {
            if (cliOptions.mcpTools.length > 0) {
                selectedMcpTools = cliOptions.mcpTools;
            } else if (cliOptions.autoInstall) {
                selectedMcpTools = ['pampa'];
            } else {
                const { mcpTools } = await inquirer.prompt([
                    {
                        type: 'checkbox',
                        name: 'mcpTools',
                        message: 'Select MCP tools to install rules for:',
                        choices: availableMcpTools.map(tool => ({
                            name: `${tool.name} - ${tool.description}`,
                            value: tool.key,
                            checked: tool.key === 'pampa'
                        }))
                    }
                ]);
                selectedMcpTools = mcpTools;
            }
        } else {
            cliService.info('No MCP tools available in configuration');
        }
    }

    // If no stack, no global rules, and no MCP tools, exit
    if (!selectedStack && !includeGlobalRules && selectedMcpTools.length === 0) {
        cliService.info('💭 No rules selected for installation. See you later!');
        process.exit(0);
    }

    // Check if target already exists and create backup if needed
    const ideConfig = IDE_CONFIGS[selectedIde];
    let needsBackup = false;
    let targetPath = '';

    if (ideConfig.multiple) {
        // Multi-file IDE: check if rules directory exists
        targetPath = rulesDir;
        needsBackup = await baseService.directoryExistsAsync(rulesDir);
    } else {
        // Single-file IDE: check if specific file exists
        targetPath = path.join(projectPath, ideConfig.file);
        needsBackup = await fs.pathExists(targetPath);
    }

    if (needsBackup) {
        let action;
        if (cliOptions.autoInstall) {
            action = 'backup';
        } else {
            const targetName = ideConfig.multiple ? path.basename(targetPath) : ideConfig.file;
            action = await cliService.askFileAction(targetName, ideConfig.multiple);
        }

        if (action === 'cancel') {
            cliService.info('❌ Operation canceled by user');
            process.exit(0);
        }

        if (action === 'backup') {
            let backupPath;
            if (ideConfig.multiple) {
                backupPath = await stackService.createBackupAsync(targetPath);
            } else {
                backupPath = await createFileBackup(targetPath);
            }
            if (backupPath) {
                cliService.backupCreated(targetPath, backupPath);
            }
        }
    }

    // Ensure the rules directory exists
    await baseService.ensureDirectoryExistsAsync(rulesDir);

    // Show installation summary
    cliService.showInstallationSummary(selectedStack, includeGlobalRules, additionalOptions, selectedMcpTools, selectedIde);

    // Get the start time for measuring performance
    const startGeneration = Date.now();

    // Generate rules with progress tracking
    cliService.startProgress('Generating rules');

    // Prepare metadata for rule generation
    const meta = {
        projectPath: appDirectory,
        cursorPath: cliOptions.cursorPath || projectPath,
        stack: selectedStack,
        debug: debugMode,
        ...additionalOptions
    };

    // Load config only once to improve performance
    const config = configService.getConfig();

    try {
        let totalFiles = 0;
        const ideConfig = IDE_CONFIGS[selectedIde];

        if (ideConfig.multiple) {
            // Multi-file IDE (Cursor, Windsurf, Continue) - generate individual files
            // Use existing logic but adjust file extension and front matter

            // If global rules are requested, copy them
            if (includeGlobalRules) {
                const globalMeta = {
                    projectPath: appDirectory,
                    cursorPath: cliOptions.cursorPath || projectPath,
                    debug: debugMode
                };

                const globalCount = await stackService.copyGlobalRules(rulesDir, globalMeta, config);
                totalFiles += globalCount;

                // Convert files to appropriate format if not Cursor
                if (selectedIde !== 'cursor') {
                    await convertRulesForIde(path.join(rulesDir, 'global'), ideConfig);
                }
            }

            // If MCP tools are selected, copy them
            if (selectedMcpTools.length > 0) {
                const mcpCount = await mcpService.copyMcpToolsRules(rulesDir, selectedMcpTools, meta, config);
                totalFiles += mcpCount;

                // Convert files to appropriate format if not Cursor
                if (selectedIde !== 'cursor') {
                    await convertRulesForIde(path.join(rulesDir, 'mcp-tools'), ideConfig);
                }
            }

            // If stack is selected, generate stack-specific rules
            if (selectedStack) {
                const stackCount = await stackService.countStackRules(meta);
                totalFiles += stackCount;

                // Generate stack-specific rules only (global rules already copied)
                await stackService.generateRulesAsync(rulesDir, meta, config, () => { }, false);

                // Convert files to appropriate format if not Cursor
                if (selectedIde !== 'cursor') {
                    await convertRulesForIde(path.join(rulesDir, selectedStack), ideConfig);
                }
            }
        } else {
            // Single-file IDE (VS Code, Zed, Claude, etc.) - consolidate all rules
            // First generate in temp directory as .mdc files
            const tempDir = path.join(projectPath, '.temp-rules');
            await fs.ensureDir(tempDir);

            try {
                // Generate all rules in temp directory
                if (includeGlobalRules) {
                    const globalMeta = {
                        projectPath: appDirectory,
                        cursorPath: cliOptions.cursorPath || projectPath,
                        debug: debugMode
                    };
                    await stackService.copyGlobalRules(tempDir, globalMeta, config);
                }

                if (selectedMcpTools.length > 0) {
                    await mcpService.copyMcpToolsRules(tempDir, selectedMcpTools, meta, config);
                }

                if (selectedStack) {
                    await stackService.generateRulesAsync(tempDir, meta, config, () => { }, false);
                }

                // Collect all generated files and consolidate
                const allRules = await collectGeneratedRules(tempDir);
                const consolidatedContent = consolidateRulesForSingleFile(allRules, ideConfig);

                const outputPath = path.join(projectPath, ideConfig.file);
                await fs.outputFile(outputPath, consolidatedContent, 'utf8');
                totalFiles = 1;

            } finally {
                // Clean up temp directory
                await fs.remove(tempDir);
            }
        }

        // End progress tracking
        cliService.completeProgress();

        // Get the end time and calculate duration
        const endGeneration = Date.now();
        const durationMs = endGeneration - startGeneration;
        const durationFormatted = (durationMs / 1000).toFixed(2);

        // Show success message
        cliService.showSuccess(totalFiles, rulesDir, durationFormatted, selectedStack, additionalOptions, selectedIde);

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
 * Convert rules in a directory to appropriate format for IDE
 * @param {string} rulesDir - Directory containing .mdc files
 * @param {Object} ideConfig - IDE configuration
 */
async function convertRulesForIde(rulesDir, ideConfig) {
    if (!(await fs.pathExists(rulesDir))) {
        return;
    }

    const files = await fs.readdir(rulesDir);
    const mdcFiles = files.filter(f => f.endsWith('.mdc'));

    for (const file of mdcFiles) {
        const filePath = path.join(rulesDir, file);
        let content = await fs.readFile(filePath, 'utf8');

        // Remove front matter if IDE doesn't support it
        if (!ideConfig.keepFrontMatter && content.startsWith('---')) {
            const endIndex = content.indexOf('\n---', 3);
            if (endIndex !== -1) {
                content = content.slice(endIndex + 4).replace(/^\n+/, '');
            }
        }

        // Change extension if needed
        if (ideConfig.extension !== '.mdc') {
            const newFileName = file.replace('.mdc', ideConfig.extension);
            const newFilePath = path.join(rulesDir, newFileName);
            await fs.writeFile(newFilePath, content, 'utf8');
            await fs.remove(filePath); // Remove old .mdc file
        }
    }
}

/**
 * Collect all generated rules from temp directory
 * @param {string} tempDir - Temporary directory with generated rules
 * @returns {Promise<Array>} - Array of rule objects
 */
async function collectGeneratedRules(tempDir) {
    const rules = [];

    // Recursively find all .mdc files
    const findMdcFiles = async (dir) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await findMdcFiles(fullPath);
            } else if (entry.name.endsWith('.mdc')) {
                const content = await fs.readFile(fullPath, 'utf8');
                const relativePath = path.relative(tempDir, fullPath);

                rules.push({
                    filename: entry.name,
                    path: relativePath,
                    content: content,
                    title: entry.name.replace('.mdc', '')
                });
            }
        }
    };

    if (await fs.pathExists(tempDir)) {
        await findMdcFiles(tempDir);
    }

    return rules;
}

/**
 * Consolidate rules into a single file content
 * @param {Array} rules - Array of rule objects
 * @param {Object} ideConfig - IDE configuration
 * @returns {string} - Consolidated content
 */
function consolidateRulesForSingleFile(rules, ideConfig) {
    const processedRules = rules.map(rule => {
        let content = rule.content;

        // Remove front matter if IDE doesn't support it
        if (!ideConfig.keepFrontMatter && content.startsWith('---')) {
            const endIndex = content.indexOf('\n---', 3);
            if (endIndex !== -1) {
                content = content.slice(endIndex + 4).replace(/^\n+/, '');
            }
        }

        return {
            title: rule.title || rule.filename.replace(/\.(md|mdc)$/, ''),
            body: content
        };
    });

    // Sort rules by category (global, stack, mcp-tools)
    processedRules.sort((a, b) => {
        const getCategory = (rule) => {
            if (rule.path && rule.path.includes('global')) return 0;
            if (rule.path && rule.path.includes('mcp-tools')) return 2;
            return 1; // stack rules
        };
        return getCategory(a) - getCategory(b);
    });

    // Create index and sections
    const index = processedRules.map((r, i) => `${i + 1}. ${r.title}`).join('\n');
    const sections = processedRules.map(r => `## ${r.title}\n\n${r.body}`).join('\n\n');

    return `# Agent Rules\n\n${index}\n\n${sections}\n`;
}

/**
 * Create backup of a single file
 * @param {string} filePath - Path to file to backup
 * @returns {Promise<string|null>} - Path to backup file or null if failed
 */
async function createFileBackup(filePath) {
    try {
        if (!(await fs.pathExists(filePath))) {
            return null;
        }

        const date = new Date();
        const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
        const backupPath = `${filePath}.backup-${timestamp}`;

        await fs.copy(filePath, backupPath);
        return backupPath;
    } catch (error) {
        console.error(`Failed to create file backup: ${error.message}`);
        return null;
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