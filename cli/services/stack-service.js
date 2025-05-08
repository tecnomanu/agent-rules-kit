/**
 * Stack Service for Agent Rules Kit
 * Manages stack detection, versions and directory structures
 */
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Service for handling stack operations
 */
export class StackService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.configService = options.configService;
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

        // Get unique versions from config while preserving order
        const versionNumbers = Object.keys(versionRanges);
        this.debugLog(`Version numbers from config for ${stack}: ${versionNumbers.join(', ')}`);

        // Get the unique ranges they map to while preserving order
        const configVersions = [];
        const seenRanges = new Set();
        for (const vNum of versionNumbers) {
            const range = versionRanges[vNum];
            if (!seenRanges.has(range)) {
                seenRanges.add(range);
                configVersions.push(range);
            }
        }

        this.debugLog(`Version ranges for ${stack}: ${configVersions.join(', ')}`);

        // Check for version directories
        const stackDir = path.join(this.templatesDir, 'stacks', stack);
        const excludeDirs = ['base', 'architectures', 'testing', 'state-management'];
        let dirVersions = [];

        if (fs.existsSync(stackDir)) {
            dirVersions = fs.readdirSync(stackDir)
                .filter(item =>
                    fs.statSync(path.join(stackDir, item)).isDirectory() &&
                    !excludeDirs.includes(item) &&
                    item.startsWith('v')
                );
            this.debugLog(`Version directories for ${stack}: ${dirVersions.join(', ')}`);
        }

        // Combine while preserving order - first from config, then any additional from directories
        const allVersions = [...configVersions];
        dirVersions.forEach(version => {
            if (!allVersions.includes(version)) {
                allVersions.push(version);
            }
        });

        this.debugLog(`Combined versions for ${stack}: ${allVersions.join(', ')}`);

        // Format version names for display
        return allVersions.map(version => ({
            name: this.formatVersionName(stack, version),
            value: version
        }));
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
        // Format based on stack and version range
        if (stack === 'laravel') {
            if (version === 'v10-11') return 'Laravel 10-11';
            if (version === 'v8-9') return 'Laravel 8-9';
            if (version === 'v12') return 'Laravel 12';
            if (version === 'v7') return 'Laravel 7';
        } else if (stack === 'nextjs') {
            if (version === 'v14') return 'Next.js 14';
            if (version === 'v13') return 'Next.js 13';
            if (version === 'v12') return 'Next.js 12';
        } else if (stack === 'react') {
            if (version === 'v17') return 'React 17';
            if (version === 'v18') return 'React 18';
        } else if (stack === 'vue') {
            if (version === 'v2') return 'Vue 2';
            if (version === 'v3') return 'Vue 3';
        } else if (stack === 'nuxt') {
            if (version === 'v2') return 'Nuxt 2';
            if (version === 'v3') return 'Nuxt 3';
        } else if (stack === 'angular') {
            if (version === 'v14-15') return 'Angular 14-15';
            if (version === 'v16-17') return 'Angular 16-17';
        }

        // Default formatting - capitalize and make readable
        return version
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

        // Handle new version range structure with objects
        // First, check if the version is already a range key (unlikely but possible)
        if (Object.values(versionRanges).some(v => v.range_name === version)) {
            return version;
        }

        // Try direct mapping first - now with the new structure
        const versionObj = versionRanges[version];
        if (versionObj && versionObj.range_name) {
            this.debugLog(`Direct mapping found for ${stack} version ${version}: ${versionObj.range_name}`);
            return versionObj.range_name;
        }

        // If not found, try to find the range it belongs to
        // If version starts with 'v', extract the number
        const versionStr = version.startsWith('v') ? version.substring(1) : version;
        const versionNum = parseInt(versionStr, 10);

        if (!isNaN(versionNum)) {
            for (const [key, value] of Object.entries(versionRanges)) {
                const keyNum = parseInt(key, 10);
                if (!isNaN(keyNum) && keyNum === versionNum) {
                    this.debugLog(`Numeric mapping found for ${stack} version ${version}: ${value.range_name}`);
                    return value.range_name;
                }
            }
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

        // Find the entry where range_name matches versionRange
        for (const [key, value] of Object.entries(versionRanges)) {
            if (value.range_name === versionRange) {
                this.debugLog(`Found formatted name for ${versionRange}: ${value.name}`);
                return value.name;
            }
        }

        // If not found in config, fall back to the formatting function
        return this.formatVersionName(stack, versionRange);
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
                const signalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
                if (fs.existsSync(signalsDir)) {
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
            if (await fs.pathExists(baseDir)) {
                const baseFiles = (await fs.readdir(baseDir)).filter(f => f.endsWith('.md'));
                totalFiles += baseFiles.length;
                this.debugLog(`Base rules count: ${baseFiles.length}`);
            }

            // Count architecture rules if specified
            if (architecture) {
                const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
                if (await fs.pathExists(archDir)) {
                    const archFiles = (await fs.readdir(archDir)).filter(f => f.endsWith('.md'));
                    totalFiles += archFiles.length;
                    this.debugLog(`Architecture rules count: ${archFiles.length}`);
                }
            }

            // Count version-specific rules if applicable
            const versionRange = meta.versionRange;
            if (versionRange) {
                const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
                if (await fs.pathExists(versionDir)) {
                    const versionFiles = (await fs.readdir(versionDir)).filter(f => f.endsWith('.md'));
                    totalFiles += versionFiles.length;
                    this.debugLog(`Version rules count: ${versionFiles.length}`);
                }
            }

            // Count global rules if included
            if (includeGlobalRules) {
                const globalDir = path.join(this.templatesDir, 'global');
                if (await fs.pathExists(globalDir)) {
                    const globalFiles = (await fs.readdir(globalDir)).filter(f => f.endsWith('.md'));
                    totalFiles += globalFiles.length;
                    this.debugLog(`Global rules count: ${globalFiles.length}`);
                }
            }

            // Add state management rules for React if specified
            if (stack === 'react' && meta.stateManagement) {
                const stateDir = path.join(this.templatesDir, 'stacks', stack, 'state-management', meta.stateManagement);
                if (await fs.pathExists(stateDir)) {
                    const stateFiles = (await fs.readdir(stateDir)).filter(f => f.endsWith('.md'));
                    totalFiles += stateFiles.length;
                    this.debugLog(`State management rules count: ${stateFiles.length}`);
                }
            }

            // Add testing rules for React/Angular
            if (['react', 'angular'].includes(stack)) {
                const testingDir = path.join(this.templatesDir, 'stacks', stack, 'testing');
                if (await fs.pathExists(testingDir)) {
                    const testingFiles = (await fs.readdir(testingDir)).filter(f => f.endsWith('.md'));
                    totalFiles += testingFiles.length;
                    this.debugLog(`Testing rules count: ${testingFiles.length}`);
                }
            }

            // Count Angular signals rules if included
            if (stack === 'angular' && meta.includeSignals) {
                const signalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
                if (await fs.pathExists(signalsDir)) {
                    const signalsFiles = (await fs.readdir(signalsDir)).filter(f => f.endsWith('.md'));
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
        await fs.ensureDir(stackRulesDir);

        // Get a reference to the file service if needed
        const fileService = this.configService?.fileService;
        if (!fileService) {
            throw new Error('File service is required but not available');
        }

        // Process global rules if requested
        if (includeGlobalRules) {
            const globalRules = config.global?.rules || [];

            if (globalRules.length > 0) {
                const globalDir = path.join(rulesDir, 'global');
                await fs.ensureDir(globalDir);

                // Get global templates
                const globalTemplatesDir = path.join(this.templatesDir, 'global');

                // Process in batches for better memory usage
                const batchSize = 10;
                for (let i = 0; i < globalRules.length; i += batchSize) {
                    const batch = globalRules.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (rule) => {
                        const sourceFile = path.join(globalTemplatesDir, rule);
                        const destFile = path.join(globalDir, rule.replace(/\.md$/, '.mdc'));

                        await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);

                        // Update progress
                        if (typeof progressCallback === 'function') {
                            progressCallback();
                        }
                    }));
                }
            }
        }

        // Process base rules
        const baseDir = path.join(this.templatesDir, 'stacks', stack, 'base');
        if (await fs.pathExists(baseDir)) {
            const baseFiles = await fs.readdir(baseDir);

            // Process in batches
            const batchSize = 10;
            for (let i = 0; i < baseFiles.length; i += batchSize) {
                const batch = baseFiles.slice(i, i + batchSize);

                await Promise.all(batch.map(async (file) => {
                    if (file.endsWith('.md')) {
                        const sourceFile = path.join(baseDir, file);
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

        // Process version overlay if applicable
        const versionRange = meta.versionRange;
        if (versionRange) {
            const versionDir = path.join(this.templatesDir, 'stacks', stack, versionRange);
            if (await fs.pathExists(versionDir)) {
                const versionFiles = await fs.readdir(versionDir);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < versionFiles.length; i += batchSize) {
                    const batch = versionFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        if (file.endsWith('.md')) {
                            const sourceFile = path.join(versionDir, file);
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

        // Process architecture-specific rules if applicable
        const architecture = meta.architecture;
        if (architecture) {
            const archDir = path.join(this.templatesDir, 'stacks', stack, 'architectures', architecture);
            if (await fs.pathExists(archDir)) {
                const archFiles = await fs.readdir(archDir);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < archFiles.length; i += batchSize) {
                    const batch = archFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        if (file.endsWith('.md')) {
                            const sourceFile = path.join(archDir, file);
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
            const signalsDir = path.join(this.templatesDir, 'stacks', stack, 'signals');
            if (await fs.pathExists(signalsDir)) {
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
} 