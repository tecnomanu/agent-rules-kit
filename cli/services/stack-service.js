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
     * Create a backup of an existing rules directory
     * @param {string} rulesDir - The rules directory to backup
     * @returns {string} - The backup directory path or null if backup wasn't created
     */
    createBackup(rulesDir) {
        if (!fs.existsSync(rulesDir)) {
            this.debugLog(`No need for backup, directory doesn't exist: ${rulesDir}`);
            return null;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `${rulesDir}-backup-${timestamp}`;

        try {
            fs.copySync(rulesDir, backupDir);
            this.debugLog(`Created backup: ${rulesDir} → ${backupDir}`);
            return backupDir;
        } catch (error) {
            this.debugLog(`Failed to create backup: ${error.message}`);
            return null;
        }
    }
} 