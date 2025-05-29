/**
 * Astro Service for Agent Rules Kit
 * Handles operations specific to the Astro stack
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Service specific to the Astro stack
 */
export class AstroService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
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
     * Copies Astro base rules
     * @param {string} targetRules - Target rules directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/astro/base');
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
        this.debugLog(`Processing ${baseFiles.length} base files for astro`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'astro');
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
                stack: 'astro',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan('astro')}`);
        return true;
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
        const overlayDir = path.join(templatesDir, 'stacks/astro', versionDir);

        if (this.fileService.directoryExists(overlayDir)) {
            this.debugLog(`Applying astro overlay from: ${overlayDir}`);
            const files = this.fileService.getFilesInDirectory(overlayDir);
            this.debugLog(`Found ${files.length} files to process`);

            // Get kit configuration for rule metadata
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(overlayDir, f);
                // Write directly to the rules directory with prefixed filename for organization
                const fileName = `${f}`.replace(/\.md$/, '.mdc');
                // Store in stack-specific subfolder
                const stackFolder = path.join(targetRules, 'astro');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pass correct metadata including projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'astro',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Processed overlay file: ${f}`);
            });

            console.log(`${chalk.green('✅')} Applied version-specific rules ${chalk.yellow(versionDir)} for ${chalk.cyan('astro')}`);
        } else {
            this.debugLog(`Overlay directory doesn't exist: ${overlayDir}`);
        }
    }
} 