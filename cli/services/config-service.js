/**
 * Config Service for Agent Rules Kit
 * Manages configuration and settings loading
 */
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Service for managing kit configuration
 */
export class ConfigService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.templatesDir = options.templatesDir;
        this.configCache = null;
    }

    /**
     * Loads kit configuration from templates/kit-config.json
     * @param {string} templatesDir - Optional templates directory
     * @returns {Object} Loaded configuration or default configuration
     */
    loadKitConfig(templatesDir = this.templatesDir) {
        // If we already have cached configuration, return it
        if (this.configCache) {
            return this.configCache;
        }

        try {
            const configPath = path.join(templatesDir, 'kit-config.json');
            this.debugLog(`Loading configuration from: ${configPath}`);

            if (!fs.existsSync(configPath)) {
                this.debugLog('Configuration file not found, using default configuration');
                return this.getDefaultConfig();
            }

            const configText = fs.readFileSync(configPath, 'utf8');
            this.configCache = JSON.parse(configText);
            return this.configCache;
        } catch (err) {
            console.error(`Error loading kit configuration: ${err}`);
            return this.getDefaultConfig();
        }
    }

    /**
     * Gets default configuration when kit-config.json cannot be loaded
     * @returns {Object} Default configuration
     */
    getDefaultConfig() {
        this.debugLog('Returning default configuration');
        return {
            global: {
                always: ["README.md", "CONTRIBUTING.md"]
            },
            laravel: {
                version_ranges: {
                    "8": "v8-9",
                    "9": "v8-9",
                    "10": "v10-11",
                    "11": "v10-11"
                },
                globs: ["<root>/app/**/*.php", "<root>/routes/**/*.php", "<root>/config/**/*.php"],
                pattern_rules: {
                    "<root>/app/Http/Controllers/**/*.php": ["controllers/controller-methods.md"],
                    "<root>/app/Models/**/*.php": ["models/eloquent-best-practices.md"],
                    "<root>/routes/**/*.php": ["routes/route-organization.md"]
                },
                architectures: {
                    "standard": {
                        "name": "Standard Laravel (MVC with Repositories)",
                        "globs": ["<root>/app/**/*.php"]
                    }
                }
            },
            nextjs: {
                version_ranges: {
                    "12": "v12",
                    "13": "v13",
                    "14": "v14"
                },
                globs: ["<root>/app/**/*.{js,jsx,ts,tsx}", "<root>/pages/**/*.{js,jsx,ts,tsx}", "<root>/src/**/*.{js,jsx,ts,tsx}"],
                pattern_rules: {
                    "<root>/app/**/*.{js,jsx,ts,tsx}": ["app-dir/route-handlers.md"],
                    "<root>/pages/api/**/*.{js,jsx,ts,tsx}": ["pages/api-routes.md"]
                },
                architectures: {
                    "app": {
                        "name": "App Router",
                        "globs": ["<root>/app/**/*.{js,jsx,ts,tsx}"]
                    },
                    "pages": {
                        "name": "Pages Router",
                        "globs": ["<root>/pages/**/*.{js,jsx,ts,tsx}"]
                    }
                }
            },
            react: {
                version_ranges: {
                    "17": "v17",
                    "18": "v18"
                },
                globs: ["<root>/src/**/*.{js,jsx,ts,tsx}"],
                architectures: {
                    "standard": {
                        "name": "Standard Component Structure",
                        "globs": ["<root>/src/**/*.{js,jsx,ts,tsx}"]
                    }
                }
            }
        };
    }

    /**
     * Gets the global rules that should always be included
     * @returns {Array<string>} List of global rule filenames
     */
    getGlobalRules() {
        const config = this.loadKitConfig();
        return config.global?.always || [];
    }

    /**
     * Process template variables in content
     * @param {string} content - Template content
     * @param {Object} meta - Metadata with variables
     * @returns {string} - Processed content
     */
    processTemplateVariables(content, meta = {}) {
        if (!content) return content;

        let processedContent = content;

        // Define all possible template variables
        // TODO: chequear si estamo soka pero formattedVersionName es formattedVersionRange.
        const templateVariables = [
            { value: meta.detectedVersion, replace: 'detectedVersion' },
            // { value: meta.versionRange, replace: 'versionRange' },
            { value: meta.formattedVersionName, replace: 'versionRange' },
            { value: meta.projectPath, replace: 'projectPath' },
            { value: meta.stack, replace: 'stack' },
            { value: meta.architecture, replace: 'architecture' },
            { value: meta.stackFormatted, replace: 'stackFormatted' }
        ];

        // Replace all template variables with their values
        templateVariables.forEach(({ value, replace }) => {
            if (value !== undefined && value !== null) {
                const regex = new RegExp(`\\{${replace}\\}`, 'g');
                processedContent = processedContent.replace(regex, value);
            }
        });

        // Special handling for versionRange - if there's a formattedVersionName, use it instead
        if (meta.formattedVersionName && !meta.versionRange) {
            const regex = new RegExp(`\\{versionRange\\}`, 'g');
            processedContent = processedContent.replace(regex, meta.formattedVersionName);
        }

        this.debugLog(`Processed template variables. Original length: ${content.length}, New length: ${processedContent.length}`);
        return processedContent;
    }

    /**
     * Validates user configuration options before applying any changes
     * @param {Object} options - User configuration options
     * @returns {Object} - Validation result with status and messages
     */
    validateOptions(options) {
        const result = {
            valid: true,
            messages: []
        };

        // Check required options
        if (!options.stack) {
            result.valid = false;
            result.messages.push('Stack is required');
        }

        if (!options.outputDir) {
            result.valid = false;
            result.messages.push('Output directory is required');
        }

        // Check if stack exists in config
        const config = this.loadKitConfig();
        if (options.stack && !config[options.stack]) {
            result.valid = false;
            result.messages.push(`Stack "${options.stack}" is not supported`);
        }

        return result;
    }

    /**
     * Handles backup options when rules directory already exists
     * @param {string} rulesDir - Rules directory path
     * @returns {Object} - Backup result with action and path
     */
    handleBackupOptions(rulesDir) {
        if (!fs.existsSync(rulesDir)) {
            return { action: 'create', backupPath: null };
        }

        // Create timestamp for backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `${rulesDir}-backup-${timestamp}`;

        return {
            action: 'backup',
            backupPath: backupDir,
            originalPath: rulesDir
        };
    }

    /**
     * Saves the kit configuration
     * @param {Object} config - The configuration to save
     * @param {string} templatesDir - Optional templates directory
     * @returns {boolean} - true if the save was successful, false if not
     */
    saveKitConfig(config, templatesDir = this.templatesDir) {
        try {
            const configPath = path.join(templatesDir, 'kit-config.json');
            this.debugLog(`Saving configuration to: ${configPath}`);

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
            this.configCache = config;
            return true;
        } catch (err) {
            console.error(`Error saving kit configuration: ${err}`);
            return false;
        }
    }
} 