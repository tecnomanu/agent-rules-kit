/**
 * Laravel Service for Agent Rules Kit
 * Handles operations specific to the Laravel stack
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Service specific to the Laravel stack
 */
export class LaravelService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copies specific architecture rules
     * @param {string} architecture - Architecture name
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;

        // Use the new structure from stacks/laravel/architectures
        const archDir = path.join(templatesDir, 'stacks/laravel/architectures', architecture);
        // Fallback to old structure if new one doesn't exist
        const oldArchDir = path.join(templatesDir, 'architectures/laravel', architecture);

        const sourceDir = this.fileService.directoryExists(archDir) ? archDir : oldArchDir;
        this.debugLog(`Looking for architecture rules in: ${sourceDir}`);

        if (this.fileService.directoryExists(sourceDir)) {
            const files = this.fileService.getFilesInDirectory(sourceDir);
            this.debugLog(`Found ${files.length} architecture files to process`);

            // Get kit configuration for rule metadata
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(sourceDir, f);
                // Write to stack folder with architecture prefix
                const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
                // Store in stack folder
                const stackFolder = path.join(targetRules, 'laravel');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pass correct metadata including projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'laravel',
                    architecture: architecture,
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Processed architecture file: ${f}`);
            });

            console.log(`${chalk.green('✅')} Applied ${chalk.magenta(architecture)} architecture rules for ${chalk.cyan('laravel')}`);
        } else {
            this.debugLog(`Architecture directory doesn't exist: ${sourceDir}`);
        }
    }

    /**
     * Copies version-specific overlay
     * @param {string} versionDir - Version directory
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyVersionOverlay(versionDir, targetRules, options = {}) {
        if (!versionDir) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const overlayDir = path.join(templatesDir, 'stacks/laravel', versionDir);

        if (this.fileService.directoryExists(overlayDir)) {
            this.debugLog(`Applying laravel overlay from: ${overlayDir}`);
            const files = this.fileService.getFilesInDirectory(overlayDir);
            this.debugLog(`Found ${files.length} files to process`);

            // Get kit configuration for rule metadata
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(overlayDir, f);
                // Write directly to the rules directory with prefixed filename for organization
                const fileName = `${f}`.replace(/\.md$/, '.mdc');
                // Store in stack-specific subfolder
                const stackFolder = path.join(targetRules, 'laravel');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pass correct metadata including projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'laravel',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Processed overlay file: ${f}`);
            });

            console.log(`${chalk.green('✅')} Applied version-specific rules ${chalk.yellow(versionDir)} for ${chalk.cyan('laravel')}`);
        } else {
            this.debugLog(`Overlay directory doesn't exist: ${overlayDir}`);
        }
    }

    /**
     * Copies Laravel base rules
     * @param {string} targetRules - Target rules directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/laravel/base');
        this.debugLog(`Looking for base rules in: ${baseDir}`);

        if (!this.fileService.directoryExists(baseDir)) {
            console.error(chalk.red(`❌ Base directory not found: ${baseDir}`));
            return false;
        }

        this.debugLog(`Found base directory with ${this.fileService.getFilesInDirectory(baseDir).length} files`);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        // Iterate over base files and add project path and version info
        const baseFiles = this.fileService.getFilesInDirectory(baseDir);
        this.debugLog(`Processing ${baseFiles.length} base files for laravel`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'laravel');
        this.fileService.ensureDirectoryExists(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Store in stack folder with original name
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            this.debugLog(`Copying ${f} to ${fileName}`);

            // Custom metadata for each file
            const fileMeta = {
                ...versionMeta,
                stack: 'laravel',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan('laravel')}`);
        return true;
    }
} 