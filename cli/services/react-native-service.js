/**
 * React Native Service for Agent Rules Kit
 * Handles operations specific to the React Native stack
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Service specific to the React Native stack
 */
export class ReactNativeService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
        this.stackName = 'react-native'; // Define stack name
    }

    /**
     * Copies base rules for React Native
     * @param {string} targetRules - Target rules directory path (e.g., '.cursor/rules/rules-kit')
     * @param {Object} versionMeta - Version metadata (e.g., { detectedVersion: '0.72', versionRange: 'v0.7x' })
     * @param {Object} options - Additional options (e.g., { projectPath: './', debug: false })
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        this.debugLog(`Copying React Native base rules to ${targetRules}`);
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks', this.stackName, 'base');

        if (!this.fileService.directoryExists(baseDir)) {
            console.error(chalk.red(`❌ Base directory not found for React Native: ${baseDir}`));
            return false;
        }

        const kitConfig = this.configService.loadKitConfig(templatesDir);
        const baseFiles = this.fileService.getFilesInDirectory(baseDir);
        this.debugLog(`Found ${baseFiles.length} base files for ${this.stackName}`);

        const stackFolder = path.join(targetRules, this.stackName); // e.g., .cursor/rules/rules-kit/react-native
        this.fileService.ensureDirectoryExists(stackFolder);

        baseFiles.forEach(f => {
            if (f.endsWith('.md')) { // Ensure we only process markdown files
                const srcFile = path.join(baseDir, f);
                const destFile = path.join(stackFolder, f.replace(/\.md$/, '.mdc'));

                const fileMeta = {
                    ...versionMeta,
                    stack: this.stackName,
                    projectPath: options.projectPath || '.',
                    debug: options.debug || this.debug,
                };
                this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
            }
        });

        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan(this.stackName)}`);
        return true;
    }

    /**
     * Copies architecture-specific rules for React Native (Placeholder)
     * @param {string} targetRules - Path to the target directory
     * @param {string} architecture - Name of the chosen architecture
     * @param {Object} options - Additional options
     */
    copyArchitectureRules(targetRules, architecture, options = {}) {
        this.debugLog(`Copying architecture rules for ${architecture} for ${this.stackName} (Not yet implemented)`);
        // No specific architecture rules for React Native in the initial setup.
        // This method can be expanded later.
        return false;
    }

    /**
     * Copies version-specific rules for React Native (Placeholder)
     * @param {string} targetRules - Path to the target directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyVersionOverlay(targetRules, versionMeta, options = {}) {
        this.debugLog(`Looking for specific rules for ${this.stackName} ${versionMeta.detectedVersion} (Not yet implemented)`);
        // No version-specific overlays for React Native in the initial setup.
        // This method can be expanded later.
        return false;
    }
}
