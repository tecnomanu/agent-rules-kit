/**
 * Angular Service for Agent Rules Kit
 * Handles operations specific to the Angular stack
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Service specific to the Angular stack
 */
export class AngularService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copies specific architecture rules for Angular
     * @param {string} architecture - Architecture name (standard, modular, etc.)
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const archDir = path.join(templatesDir, 'stacks/angular/architectures', architecture);

        this.debugLog(`Looking for Angular architecture rules: ${architecture}`);

        if (!this.fileService.directoryExists(archDir)) {
            this.debugLog(`Angular architecture directory not found: ${archDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(archDir);
        this.debugLog(`Found ${files.length} architecture files for Angular ${architecture}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'angular');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(archDir, f);
            // Use prefix to indicate architecture
            const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Custom metadata for each file
            const meta = {
                stack: 'angular',
                architecture: architecture,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed Angular architecture file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied ${chalk.magenta(architecture)} architecture rules for Angular`);
    }

    /**
     * Copies testing rules for Angular
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyTestingRules(targetRules, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const testingDir = path.join(templatesDir, 'stacks/angular/testing');

        this.debugLog(`Looking for testing rules for Angular`);

        if (!this.fileService.directoryExists(testingDir)) {
            this.debugLog(`Angular testing directory not found: ${testingDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(testingDir);
        this.debugLog(`Found ${files.length} testing files for Angular`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'angular');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(testingDir, f);
            // Use prefix to indicate that it's a testing rule
            const fileName = `testing-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Custom metadata for each file
            const meta = {
                stack: 'angular',
                testing: true,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed Angular testing file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied testing rules for Angular`);
    }

    /**
     * Copies Angular signals rules
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copySignalsRules(targetRules, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const signalsDir = path.join(templatesDir, 'stacks/angular/signals');

        this.debugLog(`Looking for signals rules for Angular`);

        if (!this.fileService.directoryExists(signalsDir)) {
            this.debugLog(`Angular signals directory not found: ${signalsDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(signalsDir);
        this.debugLog(`Found ${files.length} signals files for Angular`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'angular');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(signalsDir, f);
            // Use prefix to indicate that it's a signals rule
            const fileName = `signals-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Custom metadata for each file
            const meta = {
                stack: 'angular',
                signals: true,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed Angular signals file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied signals rules for Angular`);
    }

    /**
     * Copies version-specific overlay rules for Angular
     * @param {string} targetRules - Target rules directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyVersionOverlay(targetRules, versionMeta, options = {}) {
        if (!versionMeta || !versionMeta.versionRange) {
            this.debugLog('No version range specified for Angular, skipping version overlay');
            return false;
        }

        const templatesDir = options.templatesDir || this.templatesDir;
        const versionFolder = path.join(templatesDir, 'stacks/angular', versionMeta.versionRange);

        this.debugLog(`Looking for Angular version-specific rules: ${versionMeta.versionRange}`);

        if (!this.fileService.directoryExists(versionFolder)) {
            this.debugLog(`Angular version directory not found: ${versionFolder}`);
            return false;
        }

        const files = this.fileService.getFilesInDirectory(versionFolder);
        this.debugLog(`Found ${files.length} version-specific files for Angular ${versionMeta.versionRange}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'angular');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(versionFolder, f);
            // Use prefix to indicate version
            const fileName = `version-${versionMeta.detectedVersion}-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Custom metadata for each file
            const meta = {
                stack: 'angular',
                versionSpecific: true,
                version: versionMeta.detectedVersion,
                versionRange: versionMeta.versionRange,
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed Angular version-specific file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied version-specific rules for ${chalk.cyan('Angular')} ${chalk.yellow(versionMeta.versionRange)}`);
        return true;
    }

    /**
     * Copies Angular base rules
     * @param {string} targetRules - Target rules directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/angular/base');
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
        this.debugLog(`Processing ${baseFiles.length} base files for angular`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'angular');
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
                stack: 'angular',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan('angular')}`);
        return true;
    }
} 