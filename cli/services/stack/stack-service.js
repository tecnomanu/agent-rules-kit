/**
 * Stack Service for Agent Rules Kit
 * Manages stack detection, versions and directory structures
 */
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Service for handling stack operations
 */
export class StackService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.configService = options.configService;
        this.fileService = options.fileService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Get all available stacks from the kit-config and template directories
     * @returns {Array<string>} List of available stacks
     */
    getAvailableStacks() {
        // First, check which stacks are defined in the config
        const kitConfig = this.configService.loadKitConfig(this.templatesDir);
        const configStacks = Object.keys(kitConfig)
            .filter(key => typeof kitConfig[key] === 'object' && !['global'].includes(key));

        this.debugLog(`Stacks defined in config: ${configStacks.join(', ')}`);

        // Then check which stacks have template directories
        const stacksDir = path.join(this.templatesDir, 'stacks');
        let templateStacks = [];

        if (fs.existsSync(stacksDir)) {
            templateStacks = fs.readdirSync(stacksDir)
                .filter(item => fs.statSync(path.join(stacksDir, item)).isDirectory());
            this.debugLog(`Stacks with template directories: ${templateStacks.join(', ')}`);
        }

        // Combine and deduplicate the lists while maintaining order
        // We prioritize template directories and then add any missing config stacks
        const allStacks = [...templateStacks];
        configStacks.forEach(stack => {
            if (!allStacks.includes(stack)) {
                allStacks.push(stack);
            }
        });

        this.debugLog(`Combined available stacks: ${allStacks.join(', ')}`);
        return allStacks;
    }

    /**
     * Get available architectures for a specific stack
     * @param {string} stack - The stack to check
     * @returns {Array<Object>} - List of available architectures with name and value
     */
    getAvailableArchitectures(stack) {
        const kitConfig = this.configService.loadKitConfig(this.templatesDir);

        // Check if architectures are defined in config
        const configArchitectures = kitConfig[stack]?.architectures ?
            Object.keys(kitConfig[stack].architectures) : [];

        this.debugLog(`Architectures defined in config for ${stack}: ${configArchitectures.join(', ')}`);

        // Check for architecture directories
        const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures');
        let dirArchitectures = [];

        if (fs.existsSync(archDir)) {
            dirArchitectures = fs.readdirSync(archDir)
                .filter(item => fs.statSync(path.join(archDir, item)).isDirectory());
            this.debugLog(`Architecture directories for ${stack}: ${dirArchitectures.join(', ')}`);
        }

        // Combine and deduplicate while preserving proper order
        // Prioritize architectures defined in config first
        const allArchitectures = [...configArchitectures];
        dirArchitectures.forEach(arch => {
            if (!allArchitectures.includes(arch)) {
                allArchitectures.push(arch);
            }
        });

        this.debugLog(`Combined architectures for ${stack}: ${allArchitectures.join(', ')}`);

        // Create formatted architecture objects with display names from config
        return allArchitectures.map(arch => {
            // Try to get name from config
            const configName = kitConfig[stack]?.architectures?.[arch]?.name;

            return {
                name: configName || this.formatArchitectureName(arch, stack),
                value: arch
            };
        });
    }

    /**
     * Format architecture name for display (fallback if not defined in config)
     * @param {string} name - Architecture key
     * @param {string} stack - Stack name for context-specific formatting
     * @returns {string} - Formatted name
     */
    formatArchitectureName(name, stack) {
        // Default formatting: capitalize and make readable
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get available versions for a stack
     * @param {string} stack - The stack to check
     * @returns {Array<Object>} - List of available versions with name and value
     */
    getAvailableVersions(stack) {
        const kitConfig = this.configService.loadKitConfig(this.templatesDir);

        // Get versions from stack-specific version ranges
        const versionRanges = kitConfig[stack]?.version_ranges || {};

        // Transform version ranges into an array of version objects
        const versions = [];

        // Process each version entry individually to avoid duplicate options
        Object.entries(versionRanges).forEach(([versionNum, versionData]) => {
            // Check if we already added this exact version
            if (!versions.some(v => v.value === versionNum)) {
                versions.push({
                    name: versionNum, // Usar la clave como nombre principal
                    value: versionNum // Y también como valor
                });
            }
        });

        this.debugLog(`Available versions for ${stack}: ${versions.map(v => v.name).join(', ')}`);

        return versions;
    }

    /**
     * Extract numeric version from a version string
     * @param {string} version - Version string (like "v10" or "v10-11")
     * @returns {number|null} - Extracted number or null if not found
     */
    extractVersionNumber(version) {
        const match = version.match(/^v(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return null;
    }

    /**
     * Format version name for display
     * @param {string} stack - The stack
     * @param {string} version - Version string
     * @returns {string} - Formatted name
     */
    formatVersionName(stack, version) {
        // Ensure version is a string
        const versionStr = String(version);

        // Format based on stack and version range
        if (stack === 'laravel') {
            if (versionStr === 'v10-11') return 'Laravel 10-11';
            if (versionStr === 'v8-9') return 'Laravel 8-9';
            if (versionStr === 'v12') return 'Laravel 12';
            if (versionStr === 'v7') return 'Laravel 7';
        } else if (stack === 'nextjs') {
            if (versionStr === 'v14') return 'Next.js 14';
            if (versionStr === 'v13') return 'Next.js 13';
            if (versionStr === 'v12') return 'Next.js 12';
        } else if (stack === 'react') {
            if (versionStr === 'v17') return 'React 17';
            if (versionStr === 'v18') return 'React 18';
        } else if (stack === 'vue') {
            if (versionStr === 'v2') return 'Vue 2';
            if (versionStr === 'v3') return 'Vue 3';
        } else if (stack === 'nuxt') {
            if (versionStr === 'v2') return 'Nuxt 2';
            if (versionStr === 'v3') return 'Nuxt 3';
        } else if (stack === 'angular') {
            if (versionStr === 'v14-15') return 'Angular 14-15';
            if (versionStr === 'v16-17') return 'Angular 16-17';
        }

        // Default formatting - capitalize and make readable
        return versionStr
            .replace('v', `${stack.charAt(0).toUpperCase() + stack.slice(1)} `)
            .replace('-', ' to ');
    }

    /**
     * Map a specific version to a version range
     * @param {string} stack - The stack
     * @param {string} version - The specific version
     * @returns {string} - The mapped version range or null
     */
    mapVersionToRange(stack, version) {
        if (!version) return null;

        const kitConfig = this.configService.loadKitConfig(this.templatesDir);
        const versionRanges = kitConfig[stack]?.version_ranges || {};

        // Direct mapping - version is a key in version_ranges
        if (versionRanges[version]) {
            return versionRanges[version].range_name;
        }

        this.debugLog(`No mapping found for ${stack} version ${version}`);
        return null;
    }

    /**
     * Get formatted version name for a specific version range
     * @param {string} stack - The stack
     * @param {string} versionRange - The version range (e.g. v10-11)
     * @returns {string} - Formatted version name
     */
    getFormattedVersionName(stack, versionRange) {
        if (!versionRange) return null;

        // Try to find the formatted name in the configuration
        const kitConfig = this.configService.loadKitConfig(this.templatesDir);
        const versionRanges = kitConfig[stack]?.version_ranges || {};

        // Check directly if this version exists in the config
        if (versionRanges[versionRange]) {
            return versionRanges[versionRange].name;
        }

        // If we're looking for a range_name, find the entry that matches
        for (const [key, value] of Object.entries(versionRanges)) {
            if (value.range_name === versionRange) {
                return value.name;
            }
        }

        // Default formatting if not found in config
        return `${stack.charAt(0).toUpperCase() + stack.slice(1)} ${versionRange}`;
    }

    /**
     * Detect version of Laravel from composer.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectLaravelVersion(projectPath) {
        try {
            const composerPath = path.join(projectPath, 'composer.json');
            this.debugLog(`Looking for composer.json at: ${composerPath}`);

            if (!fs.existsSync(composerPath)) {
                this.debugLog('composer.json not found');
                return null;
            }

            const composerContent = fs.readFileSync(composerPath, 'utf8');
            const composer = JSON.parse(composerContent);
            this.debugLog(`Found composer.json with content length: ${composerContent.length}`);

            if (!composer.require || !composer.require['laravel/framework']) {
                this.debugLog('Laravel framework not found in composer.json');
                return null;
            }

            const versionStr = composer.require['laravel/framework'];
            this.debugLog(`Found Laravel version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected Laravel version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting Laravel version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect version of Next.js from package.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectNextjsVersion(projectPath) {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            this.debugLog(`Looking for package.json at: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                this.debugLog('package.json not found');
                return null;
            }

            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const pkg = JSON.parse(packageContent);
            this.debugLog(`Found package.json with content length: ${packageContent.length}`);

            if (!pkg.dependencies || !pkg.dependencies.next) {
                this.debugLog('Next.js not found in package.json dependencies');
                return null;
            }

            const versionStr = pkg.dependencies.next;
            this.debugLog(`Found Next.js version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected Next.js version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting Next.js version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect version of React from package.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectReactVersion(projectPath) {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            this.debugLog(`Looking for package.json at: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                this.debugLog('package.json not found');
                return null;
            }

            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const pkg = JSON.parse(packageContent);
            this.debugLog(`Found package.json with content length: ${packageContent.length}`);

            if (!pkg.dependencies || !pkg.dependencies.react) {
                this.debugLog('React not found in package.json dependencies');
                return null;
            }

            const versionStr = pkg.dependencies.react;
            this.debugLog(`Found React version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected React version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting React version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect version of Angular from package.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectAngularVersion(projectPath) {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            this.debugLog(`Looking for package.json at: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                this.debugLog('package.json not found');
                return null;
            }

            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const pkg = JSON.parse(packageContent);
            this.debugLog(`Found package.json with content length: ${packageContent.length}`);

            if (!pkg.dependencies || !pkg.dependencies['@angular/core']) {
                this.debugLog('Angular not found in package.json dependencies');
                return null;
            }

            const versionStr = pkg.dependencies['@angular/core'];
            this.debugLog(`Found Angular version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected Angular version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting Angular version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect version of Vue from package.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectVueVersion(projectPath) {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            this.debugLog(`Looking for package.json at: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                this.debugLog('package.json not found');
                return null;
            }

            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const pkg = JSON.parse(packageContent);
            this.debugLog(`Found package.json with content length: ${packageContent.length}`);

            if (!pkg.dependencies || !pkg.dependencies.vue) {
                this.debugLog('Vue not found in package.json dependencies');
                return null;
            }

            const versionStr = pkg.dependencies.vue;
            this.debugLog(`Found Vue version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected Vue version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting Vue version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect version of Astro from package.json
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not found
     */
    detectAstroVersion(projectPath) {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            this.debugLog(`Looking for package.json at: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                this.debugLog('package.json not found');
                return null;
            }

            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const pkg = JSON.parse(packageContent);
            this.debugLog(`Found package.json with content length: ${packageContent.length}`);

            if (!pkg.dependencies || !pkg.dependencies.astro) {
                this.debugLog('Astro not found in package.json dependencies');
                return null;
            }

            const versionStr = pkg.dependencies.astro;
            this.debugLog(`Found Astro version: ${versionStr}`);

            // Extract major version number
            const match = versionStr.match(/\d+/);
            if (match) {
                const version = parseInt(match[0], 10);
                this.debugLog(`Detected Astro version: ${version}`);
                return version.toString();
            }
        } catch (error) {
            this.debugLog(`Error detecting Astro version: ${error.message}`);
        }
        return null;
    }

    /**
     * Detect stack version based on project files
     * @param {string} stack - The stack to detect version for
     * @param {string} projectPath - Path to the project root
     * @returns {string|null} - Detected version or null if not detected
     */
    detectStackVersion(stack, projectPath) {
        this.debugLog(`Attempting to detect ${stack} version in ${projectPath}`);

        // Resolve absolute path for project
        const resolvedPath = path.resolve(projectPath);
        this.debugLog(`Resolved project path: ${resolvedPath}`);

        // Use the appropriate detector based on stack
        switch (stack.toLowerCase()) {
            case 'laravel':
                return this.detectLaravelVersion(resolvedPath);
            case 'nextjs':
                return this.detectNextjsVersion(resolvedPath);
            case 'react':
                return this.detectReactVersion(resolvedPath);
            case 'angular':
                return this.detectAngularVersion(resolvedPath);
            case 'vue':
                return this.detectVueVersion(resolvedPath);
            case 'astro':
                return this.detectAstroVersion(resolvedPath);
            default:
                this.debugLog(`No version detector available for ${stack}`);
                return null;
        }
    }

    /**
     * Format the rules output directory path
     * @param {string} basePath - Base path for the project
     * @returns {string} - The formatted path to the rules directory
     */
    formatRulesPath(basePath) {
        // Always create rules in .cursor/rules/rules-kit relative to basePath
        const normalizedBasePath = basePath === '.' ? '' : basePath;
        const rulesPath = path.join(normalizedBasePath, '.cursor', 'rules', 'rules-kit');

        this.debugLog(`Formatted rules path: ${rulesPath} from base: ${basePath}`);
        return rulesPath;
    }

    /**
     * Creates a backup of the rules directory
     * @param {string} rulesDir - Rules directory to backup
     * @returns {string|null} - Path to backup directory or null if failed
     */
    createBackup(rulesDir) {
        try {
            // Check if directory exists first
            if (!fs.existsSync(rulesDir)) {
                return null;
            }

            // Generate backup directory name with date
            const date = new Date();
            const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
            const backupDir = `${rulesDir}-backup-${timestamp}`;

            // Copy directory
            fs.copySync(rulesDir, backupDir);
            this.debugLog(`Created backup at ${backupDir}`);
            return backupDir;
        } catch (error) {
            this.debugLog(`Failed to create backup: ${error.message}`);
            return null;
        }
    }

    /**
     * Creates a backup of the rules directory asynchronously
     * @param {string} rulesDir - Rules directory to backup
     * @returns {Promise<string|null>} - Path to backup directory or null if failed
     */
    async createBackupAsync(rulesDir) {
        try {
            // Check if directory exists first
            if (!await fs.pathExists(rulesDir)) {
                return null;
            }

            // Generate backup directory name with date
            const date = new Date();
            const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
            const backupDir = `${rulesDir}-backup-${timestamp}`;

            // Copy directory asynchronously
            await fs.copy(rulesDir, backupDir);
            this.debugLog(`Created backup at ${backupDir}`);
            return backupDir;
        } catch (error) {
            this.debugLog(`Failed to create backup: ${error.message}`);
            return null;
        }
    }

    /**
     * Count the total number of rule files to be generated
     * @param {Object} meta - Metadata for counting rules
     * @returns {number} - Total number of files to be generated
     */
    countTotalRules(meta) {
        let totalFiles = 0;
        const { stack, architecture, includeGlobalRules } = meta;

        try {
            // Count base rules
            const baseDir = path.join(this.templatesDir, 'stacks', stack, 'base');
            if (fs.existsSync(baseDir)) {
                const baseFiles = fs.readdirSync(baseDir).filter(f => f.endsWith('.md'));
                totalFiles += baseFiles.length;
                this.debugLog(`Base rules count: ${baseFiles.length}`);
            }

            // Count architecture rules if specified
            if (architecture) {
                const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
                if (fs.existsSync(archDir)) {
                    const archFiles = fs.readdirSync(archDir).filter(f => f.endsWith('.md'));
                    totalFiles += archFiles.length;
                    this.debugLog(`Architecture rules count: ${archFiles.length}`);
                }
            }

            // Count version-specific rules if applicable
            const versionRange = meta.versionRange;
            if (versionRange) {
                const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
                if (fs.existsSync(versionDir)) {
                    const versionFiles = fs.readdirSync(versionDir).filter(f => f.endsWith('.md'));
                    totalFiles += versionFiles.length;
                    this.debugLog(`Version rules count: ${versionFiles.length}`);
                }
            }

            // Count global rules if included
            if (includeGlobalRules) {
                const globalDir = path.join(this.templatesDir, 'global');
                if (fs.existsSync(globalDir)) {
                    const globalFiles = fs.readdirSync(globalDir).filter(f => f.endsWith('.md'));
                    totalFiles += globalFiles.length;
                    this.debugLog(`Global rules count: ${globalFiles.length}`);
                }
            }

            // Add state management rules for React if specified
            if (stack === 'react' && meta.stateManagement) {
                const stateDir = path.join(this.templatesDir, 'stacks', stack, 'state-management', meta.stateManagement);
                if (fs.existsSync(stateDir)) {
                    const stateFiles = fs.readdirSync(stateDir).filter(f => f.endsWith('.md'));
                    totalFiles += stateFiles.length;
                    this.debugLog(`State management rules count: ${stateFiles.length}`);
                }
            }

            // Add testing rules for React/Angular
            if (['react', 'angular'].includes(stack)) {
                const testingDir = path.join(this.templatesDir, 'stacks', stack, 'testing');
                if (fs.existsSync(testingDir)) {
                    const testingFiles = fs.readdirSync(testingDir).filter(f => f.endsWith('.md'));
                    totalFiles += testingFiles.length;
                    this.debugLog(`Testing rules count: ${testingFiles.length}`);
                }
            }

            // Count Angular signals rules if included
            if (stack === 'angular' && meta.includeSignals) {
                // First check for version-specific signals
                let signalsDir = null;

                if (meta.versionRange) {
                    const versionSignalsDir = path.join(this.templatesDir, 'stacks', stack, meta.versionRange);
                    if (fs.existsSync(versionSignalsDir)) {
                        signalsDir = versionSignalsDir;
                        this.debugLog(`Using version-specific signals from: ${versionSignalsDir}`);
                    }
                }

                // If no version-specific signals found, try the common signals directory
                if (!signalsDir) {
                    const commonSignalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
                    if (fs.existsSync(commonSignalsDir)) {
                        signalsDir = commonSignalsDir;
                        this.debugLog(`Using common signals from: ${commonSignalsDir}`);
                    }
                }

                if (signalsDir) {
                    const signalsFiles = fs.readdirSync(signalsDir).filter(f => f.endsWith('.md'));
                    totalFiles += signalsFiles.length;
                    this.debugLog(`Angular signals rules count: ${signalsFiles.length}`);
                }
            }

            this.debugLog(`Total rule files to generate: ${totalFiles}`);
            return totalFiles;

        } catch (error) {
            this.debugLog(`Error counting rules: ${error.message}`);
            return 10; // Default fallback value
        }
    }

    /**
     * Count the total number of rule files to be generated asynchronously
     * @param {Object} meta - Metadata for counting rules
     * @returns {Promise<number>} - Total number of files to be generated
     */
    async countTotalRulesAsync(meta) {
        let totalFiles = 0;
        const { stack, architecture, includeGlobalRules } = meta;

        try {
            // Count base rules
            const baseDir = path.join(this.templatesDir, 'stacks', stack, 'base');
            if (await this.pathExistsAsync(baseDir)) {
                const baseFiles = await fs.promises.readdir(baseDir);
                totalFiles += baseFiles.length;
                this.debugLog(`Base rules count: ${baseFiles.length}`);
            }

            // Count architecture rules if specified
            if (architecture) {
                const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
                if (await this.pathExistsAsync(archDir)) {
                    const archFiles = await fs.promises.readdir(archDir);
                    totalFiles += archFiles.length;
                    this.debugLog(`Architecture rules count: ${archFiles.length}`);
                }
            }

            // Count version-specific rules if applicable
            const versionRange = meta.versionRange;
            if (versionRange) {
                const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
                if (await this.pathExistsAsync(versionDir)) {
                    const versionFiles = await fs.promises.readdir(versionDir);
                    totalFiles += versionFiles.length;
                    this.debugLog(`Version rules count: ${versionFiles.length}`);
                }
            }

            // Count global rules if included
            if (includeGlobalRules) {
                const globalDir = path.join(this.templatesDir, 'global');
                if (await this.pathExistsAsync(globalDir)) {
                    const globalFiles = await fs.promises.readdir(globalDir);
                    totalFiles += globalFiles.length;
                    this.debugLog(`Global rules count: ${globalFiles.length}`);
                }
            }

            // Add state management rules for React if specified
            if (stack === 'react' && meta.stateManagement) {
                const stateDir = path.join(this.templatesDir, 'stacks', stack, 'state-management', meta.stateManagement);
                if (await this.pathExistsAsync(stateDir)) {
                    const stateFiles = await fs.promises.readdir(stateDir);
                    totalFiles += stateFiles.length;
                    this.debugLog(`State management rules count: ${stateFiles.length}`);
                }
            }

            // Add testing rules for React/Angular
            if (['react', 'angular'].includes(stack)) {
                const testingDir = path.join(this.templatesDir, 'stacks', stack, 'testing');
                if (await this.pathExistsAsync(testingDir)) {
                    const testingFiles = await fs.promises.readdir(testingDir);
                    totalFiles += testingFiles.length;
                    this.debugLog(`Testing rules count: ${testingFiles.length}`);
                }
            }

            // Count Angular signals rules if included
            if (stack === 'angular' && meta.includeSignals) {
                // First check for version-specific signals
                let signalsDir = null;

                if (meta.versionRange) {
                    const versionSignalsDir = path.join(this.templatesDir, 'stacks', stack, meta.versionRange);
                    if (await this.pathExistsAsync(versionSignalsDir)) {
                        signalsDir = versionSignalsDir;
                        this.debugLog(`Using version-specific signals from: ${versionSignalsDir}`);
                    }
                }

                // If no version-specific signals found, try the common signals directory
                if (!signalsDir) {
                    const commonSignalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
                    if (await this.pathExistsAsync(commonSignalsDir)) {
                        signalsDir = commonSignalsDir;
                        this.debugLog(`Using common signals from: ${commonSignalsDir}`);
                    }
                }

                if (signalsDir) {
                    const signalsFiles = await fs.promises.readdir(signalsDir);
                    totalFiles += signalsFiles.length;
                    this.debugLog(`Angular signals rules count: ${signalsFiles.length}`);
                }
            }

            this.debugLog(`Total rule files to generate: ${totalFiles}`);
            return totalFiles;

        } catch (error) {
            this.debugLog(`Error counting rules: ${error.message}`);
            return 10; // Default fallback value
        }
    }

    /**
     * Generate rules for a stack asynchronously with progress tracking
     * @param {string} rulesDir - Base directory for rules
     * @param {Object} meta - Metadata for rule generation
     * @param {Object} config - Configuration
     * @param {Function} progressCallback - Callback for progress updates
     * @param {boolean} includeGlobalRules - Whether to include global rules
     * @returns {Promise<void>}
     */
    async generateRulesAsync(rulesDir, meta, config, progressCallback, includeGlobalRules) {
        const { stack } = meta;

        // Create the stack-specific directory
        const stackRulesDir = path.join(rulesDir, stack);
        await this.ensureDirectoryExistsAsync(stackRulesDir);

        // Get a reference to the file service from this instance or from configService
        const fileService = this.fileService || (this.configService?.fileService);
        if (!fileService) {
            throw new Error('File service is required but not available');
        }

        // Map to track file paths by base name for merging duplicates
        const fileTracker = new Map();

        // Process global rules if requested
        if (includeGlobalRules) {
            // Usar always en lugar de rules ya que esa es la nomenclatura en la config
            const globalRules = config.global?.always || [];

            // Si no hay reglas definidas explícitamente, copiar todos los archivos .md de la carpeta global
            const globalTemplatesDir = path.join(this.templatesDir, 'global');
            let filesToCopy = [];

            if (globalRules.length > 0) {
                filesToCopy = globalRules;
            } else if (await this.pathExistsAsync(globalTemplatesDir)) {
                // Obtener todos los archivos .md si no hay reglas explícitas
                const allFiles = await fs.promises.readdir(globalTemplatesDir);
                filesToCopy = allFiles.filter(file => file.endsWith('.md'));
            }

            if (filesToCopy.length > 0) {
                const globalDir = path.join(rulesDir, 'global');
                await this.ensureDirectoryExistsAsync(globalDir);

                // Process in batches for better memory usage
                const batchSize = 10;
                for (let i = 0; i < filesToCopy.length; i += batchSize) {
                    const batch = filesToCopy.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (rule) => {
                        const sourceFile = path.join(globalTemplatesDir, rule);
                        const destFile = path.join(globalDir, rule.replace(/\.md$/, '.mdc'));

                        if (await this.pathExistsAsync(sourceFile)) {
                            await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);
                            this.debugLog(`Copied global rule: ${rule}`);

                            // Update progress
                            if (typeof progressCallback === 'function') {
                                progressCallback();
                            }
                        } else {
                            this.debugLog(`Global rule not found: ${rule}`);
                        }
                    }));
                }
            }
        }

        // Map to collect all file sources by their base name
        // This helps us identify duplicates across base, version-specific, and architecture folders
        const trackedFiles = new Map();

        // First collect all files from different sources
        // Process base rules - just collect paths, don't process yet
        const baseDir = path.join(this.templatesDir, 'stacks', stack, 'base');
        if (await this.pathExistsAsync(baseDir)) {
            const baseFiles = await fs.promises.readdir(baseDir);
            for (const file of baseFiles) {
                if (file.endsWith('.md')) {
                    const baseName = file; // e.g. testing-best-practices.md
                    if (!trackedFiles.has(baseName)) {
                        trackedFiles.set(baseName, []);
                    }
                    trackedFiles.get(baseName).push({
                        source: 'base',
                        path: path.join(baseDir, file)
                    });
                }
            }
        }

        // Process version overlay if applicable - collect paths
        const versionRange = meta.versionRange;
        if (versionRange) {
            const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
            if (await this.pathExistsAsync(versionDir)) {
                const versionFiles = await fs.promises.readdir(versionDir);
                for (const file of versionFiles) {
                    if (file.endsWith('.md')) {
                        const baseName = file;
                        if (!trackedFiles.has(baseName)) {
                            trackedFiles.set(baseName, []);
                        }
                        trackedFiles.get(baseName).push({
                            source: 'version',
                            path: path.join(versionDir, file)
                        });
                    }
                }
            }
        }

        // Process architecture-specific rules if applicable - collect paths
        const architecture = meta.architecture;
        if (architecture) {
            const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
            if (await this.pathExistsAsync(archDir)) {
                const archFiles = await fs.promises.readdir(archDir);
                for (const file of archFiles) {
                    if (file.endsWith('.md')) {
                        const baseName = file;
                        if (!trackedFiles.has(baseName)) {
                            trackedFiles.set(baseName, []);
                        }
                        trackedFiles.get(baseName).push({
                            source: 'architecture',
                            path: path.join(archDir, file)
                        });
                    }
                }
            }
        }

        // Now process all collected files
        let processedCount = 0;
        for (const [baseName, fileSources] of trackedFiles.entries()) {
            const destFile = path.join(stackRulesDir, baseName.replace(/\.md$/, '.mdc'));

            // If we have multiple sources for the same file, we need to merge them
            if (fileSources.length > 1) {
                this.debugLog(`Found duplicate file ${baseName} in multiple locations. Merging...`);

                // Sort sources to ensure base comes first, then version, then architecture
                fileSources.sort((a, b) => {
                    const order = { base: 1, version: 2, architecture: 3 };
                    return order[a.source] - order[b.source];
                });

                // Get the file paths in the correct order
                const filePaths = fileSources.map(source => source.path);

                try {
                    // Combine the files
                    const { frontmatter, content } = await fileService.combineMdFiles(filePaths, meta);

                    // Create the combined .mdc file with a single frontmatter section
                    let mdcContent = '---\n';

                    if (frontmatter.globs) {
                        if (Array.isArray(frontmatter.globs)) {
                            mdcContent += `globs: [${frontmatter.globs.map(g => `'${g}'`).join(', ')}]\n`;
                        } else {
                            mdcContent += `globs: '${frontmatter.globs}'\n`;
                        }
                    }

                    if (frontmatter.alwaysApply !== undefined) {
                        mdcContent += `alwaysApply: ${frontmatter.alwaysApply}\n`;
                    }

                    if (frontmatter.description) {
                        mdcContent += `description: '${frontmatter.description}'\n`;
                    }

                    mdcContent += '---\n\n';
                    mdcContent += content;

                    // Write the combined file
                    await fs.promises.writeFile(destFile, mdcContent, 'utf8');
                    this.debugLog(`Created combined file: ${destFile}`);
                } catch (error) {
                    this.debugLog(`Error merging files for ${baseName}: ${error.message}`);
                    // If combining fails, use the version-specific file (highest priority)
                    await fileService.wrapMdToMdcAsync(fileSources[fileSources.length - 1].path, destFile, meta, config);
                }
            } else {
                // Single source file, process normally
                await fileService.wrapMdToMdcAsync(fileSources[0].path, destFile, meta, config);
            }

            // Update progress
            processedCount++;
            if (typeof progressCallback === 'function') {
                progressCallback();
            }
        }

        // Process state management rules for React
        if (stack === 'react' && meta.stateManagement) {
            const stateDir = path.join(this.templatesDir, 'stacks', stack, 'state-management', meta.stateManagement);
            if (await fs.pathExists(stateDir)) {
                const stateFiles = await fs.readdir(stateDir);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < stateFiles.length; i += batchSize) {
                    const batch = stateFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        if (file.endsWith('.md')) {
                            const sourceFile = path.join(stateDir, file);
                            const destFile = path.join(stackRulesDir, file.replace(/\.md$/, '.mdc'));

                            await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);

                            // Update progress
                            if (typeof progressCallback === 'function') {
                                progressCallback();
                            }
                        }
                    }));
                }
            }
        }

        // Process testing rules for React/Angular
        if (['react', 'angular'].includes(stack)) {
            const testingDir = path.join(this.templatesDir, 'stacks', stack, 'testing');
            if (await fs.pathExists(testingDir)) {
                const testingFiles = await fs.readdir(testingDir);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < testingFiles.length; i += batchSize) {
                    const batch = testingFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        if (file.endsWith('.md')) {
                            const sourceFile = path.join(testingDir, file);
                            const destFile = path.join(stackRulesDir, file.replace(/\.md$/, '.mdc'));

                            await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);

                            // Update progress
                            if (typeof progressCallback === 'function') {
                                progressCallback();
                            }
                        }
                    }));
                }
            }
        }

        // Process Angular signals rules if applicable
        if (stack === 'angular' && meta.includeSignals) {
            // First check for version-specific signals
            let signalsDir = null;

            if (meta.versionRange) {
                const versionSignalsDir = path.join(this.templatesDir, 'stacks', stack, meta.versionRange);
                if (await fs.pathExists(versionSignalsDir)) {
                    signalsDir = versionSignalsDir;
                    this.debugLog(`Using version-specific signals from: ${versionSignalsDir}`);
                }
            }

            // If no version-specific signals found, try the common signals directory
            if (!signalsDir) {
                const commonSignalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
                if (await fs.pathExists(commonSignalsDir)) {
                    signalsDir = commonSignalsDir;
                    this.debugLog(`Using common signals from: ${commonSignalsDir}`);
                }
            }

            if (signalsDir) {
                const signalsFiles = await fs.readdir(signalsDir);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < signalsFiles.length; i += batchSize) {
                    const batch = signalsFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        if (file.endsWith('.md')) {
                            const sourceFile = path.join(signalsDir, file);
                            const destFile = path.join(stackRulesDir, file.replace(/\.md$/, '.mdc'));

                            await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);

                            // Update progress
                            if (typeof progressCallback === 'function') {
                                progressCallback();
                            }
                        }
                    }));
                }
            }
        }
    }

    /**
     * Check if a path exists asynchronously
     * @param {string} path - Path to check
     * @returns {Promise<boolean>} - True if exists, false otherwise
     */
    async pathExistsAsync(path) {
        try {
            await fs.access(path);
            return true;
        } catch (error) {
            this.debugLog(`Path does not exist: ${path}`);
            return false;
        }
    }

    /**
     * Copy global rules to the specified directory
     * @param {string} rulesDir - Target rules directory
     * @param {object} meta - Metadata for processing
     * @param {object} config - Configuration object
     */
    async copyGlobalRules(rulesDir, meta, config) {
        // Get a reference to the file service
        const fileService = this.fileService || (this.configService?.fileService);
        if (!fileService) {
            throw new Error('File service is required but not available');
        }

        // Use always rules instead of rules as that's the naming in config
        const globalRules = config.global?.always || [];

        // If no explicit rules defined, copy all .md files from global folder
        const globalTemplatesDir = path.join(this.templatesDir, 'global');
        let filesToCopy = [];

        if (globalRules.length > 0) {
            filesToCopy = globalRules;
        } else if (await this.pathExistsAsync(globalTemplatesDir)) {
            // Get all .md files if no explicit rules
            const allFiles = await fs.promises.readdir(globalTemplatesDir);
            filesToCopy = allFiles.filter(file => file.endsWith('.md'));
        }

        if (filesToCopy.length > 0) {
            const globalDir = path.join(rulesDir, 'global');
            await this.ensureDirectoryExistsAsync(globalDir);

            // Process in batches for better memory usage
            const batchSize = 10;
            for (let i = 0; i < filesToCopy.length; i += batchSize) {
                const batch = filesToCopy.slice(i, i + batchSize);

                await Promise.all(batch.map(async (rule) => {
                    const sourceFile = path.join(globalTemplatesDir, rule);
                    const destFile = path.join(globalDir, rule.replace(/\.md$/, '.mdc'));

                    if (await this.pathExistsAsync(sourceFile)) {
                        await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);
                        this.debugLog(`Copied global rule: ${rule}`);
                    } else {
                        this.debugLog(`Global rule not found: ${rule}`);
                    }
                }));
            }
        }

        return filesToCopy.length;
    }

    /**
     * Count stack-specific rules only (excluding global rules)
     * @param {object} meta - Metadata containing stack, version, architecture info
     * @returns {Promise<number>} - Number of stack-specific rule files
     */
    async countStackRules(meta) {
        const { stack, versionRange, architecture } = meta;
        let count = 0;

        // Collect unique files from all sources
        const trackedFiles = new Set();

        // Count base rules
        const baseDir = path.join(this.templatesDir, 'stacks', stack, 'base');
        if (await this.pathExistsAsync(baseDir)) {
            const baseFiles = await fs.promises.readdir(baseDir);
            baseFiles.filter(file => file.endsWith('.md')).forEach(file => {
                trackedFiles.add(file);
            });
        }

        // Count version overlay rules
        if (versionRange) {
            const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
            if (await this.pathExistsAsync(versionDir)) {
                const versionFiles = await fs.promises.readdir(versionDir);
                versionFiles.filter(file => file.endsWith('.md')).forEach(file => {
                    trackedFiles.add(file);
                });
            }
        }

        // Count architecture-specific rules
        if (architecture) {
            const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
            if (await this.pathExistsAsync(archDir)) {
                const archFiles = await fs.promises.readdir(archDir);
                archFiles.filter(file => file.endsWith('.md')).forEach(file => {
                    trackedFiles.add(file);
                });
            }
        }

        // Count state management rules for React
        if (stack === 'react' && meta.stateManagement) {
            const stateDir = path.join(this.templatesDir, 'stacks', stack, 'state-management', meta.stateManagement);
            if (await this.pathExistsAsync(stateDir)) {
                const stateFiles = await fs.promises.readdir(stateDir);
                stateFiles.filter(file => file.endsWith('.md')).forEach(file => {
                    trackedFiles.add(file);
                });
            }
        }

        return trackedFiles.size;
    }
} 