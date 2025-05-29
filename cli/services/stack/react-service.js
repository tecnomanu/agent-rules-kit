/**
 * React Service for Agent Rules Kit
 * Handles operations specific to the React stack
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Service specific to the React stack
 */
export class ReactService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copies specific architecture rules for React
     * @param {string} architecture - Architecture name (atomic, feature-sliced, etc.)
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const archDir = path.join(templatesDir, 'stacks/react/architectures', architecture);

        this.debugLog(`Looking for React architecture rules: ${architecture}`);

        if (!this.fileService.directoryExists(archDir)) {
            this.debugLog(`React architecture directory not found: ${archDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(archDir);
        this.debugLog(`Found ${files.length} architecture files for React ${architecture}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'react');
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
                stack: 'react',
                architecture: architecture,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed React architecture file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied ${chalk.magenta(architecture)} architecture rules for React`);
    }

    /**
     * Copies testing rules for React
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyTestingRules(targetRules, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const testingDir = path.join(templatesDir, 'stacks/react/testing');

        this.debugLog(`Looking for testing rules for React`);

        if (!this.fileService.directoryExists(testingDir)) {
            this.debugLog(`React testing directory not found: ${testingDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(testingDir);
        this.debugLog(`Found ${files.length} testing files for React`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'react');
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
                stack: 'react',
                testing: true,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed React testing file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied testing rules for React`);
    }

    /**
     * Copies state management rules for React
     * @param {string} stateManager - State manager name (redux, mobx, etc.)
     * @param {string} targetRules - Target rules directory
     * @param {Object} options - Additional options
     */
    copyStateManagementRules(stateManager, targetRules, options = {}) {
        if (!stateManager) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const stateDir = path.join(templatesDir, 'stacks/react/state-management', stateManager);

        this.debugLog(`Looking for React state management rules: ${stateManager}`);

        if (!this.fileService.directoryExists(stateDir)) {
            this.debugLog(`React state management directory not found: ${stateDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(stateDir);
        this.debugLog(`Found ${files.length} state management files for React ${stateManager}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'react');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Get kit configuration for rule metadata
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(stateDir, f);
            // Use prefix to indicate the state manager
            const fileName = `state-${stateManager}-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Custom metadata for each file
            const meta = {
                stack: 'react',
                stateManagement: stateManager,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Processed React state management file: ${f}`);
        });

        console.log(`${chalk.green('✅')} Applied ${chalk.yellow(stateManager)} state management rules for React`);
    }

    /**
     * Copies React base rules
     * @param {string} targetRules - Target rules directory
     * @param {Object} versionMeta - Version metadata
     * @param {Object} options - Additional options
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/react/base');
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
        this.debugLog(`Processing ${baseFiles.length} base files for react`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, 'react');
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
                stack: 'react',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan('react')}`);
        return true;
    }
} 