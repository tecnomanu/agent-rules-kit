/**
 * Common stack helpers for Agent Rules Kit
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import * as versionDetector from '../version-detector.js';
import { wrapMdToMdc } from './file-helpers.js';

/**
 * Debug log helper
 * @param {boolean} debug - Debug mode flag
 * @param {...any} args - Arguments to log
 */
const debugLog = (debug, ...args) => {
    if (debug) {
        console.log(chalk.gray('[DEBUG]'), ...args);
    }
};

/**
 * Copy version-specific overlay
 * @param {string} templatesDir - The templates directory
 * @param {string} stack - The stack name
 * @param {string} versionDir - The version directory
 * @param {string} targetRules - The target rules directory
 * @param {Object} options - Additional options
 */
export const copyVersionOverlay = (templatesDir, stack, versionDir, targetRules, options = {}) => {
    if (!versionDir) return;

    const overlayDir = path.join(templatesDir, 'stacks', stack, versionDir);
    if (fs.existsSync(overlayDir)) {
        debugLog(options.debug, `Applying ${stack} overlay from: ${overlayDir}`);
        const files = fs.readdirSync(overlayDir);
        debugLog(options.debug, `Found ${files.length} files to process`);

        files.forEach(f => {
            const srcFile = path.join(overlayDir, f);
            // Write directly to rules directory with a prefixed filename for organization
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            // Store in stack-specific subfolder
            const stackFolder = path.join(targetRules, stack);
            fs.ensureDirSync(stackFolder); // Ensure stack folder exists
            const destFile = path.join(stackFolder, fileName);

            // Pass correct metadata including projectPath
            const meta = {
                projectPath: options.projectPath || '.',
                stack: stack,
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug
            };
            wrapMdToMdc(srcFile, destFile, meta);
            debugLog(options.debug, `Processed overlay file: ${f}`);
        });
        console.log(`${chalk.green('✅')} Applied ${chalk.cyan(stack)} ${chalk.yellow(versionDir)} version-specific rules`);
    } else {
        debugLog(options.debug, `Overlay directory does not exist: ${overlayDir}`);
    }
};

/**
 * Copy architecture-specific rules
 * @param {string} templatesDir - The templates directory
 * @param {string} stack - The stack name
 * @param {string} architecture - The architecture name
 * @param {string} targetRules - The target rules directory
 * @param {Object} options - Additional options
 */
export const copyArchitectureRules = (templatesDir, stack, architecture, targetRules, options = {}) => {
    if (!architecture || stack !== 'laravel') return;

    // Use the new structure from stacks/laravel/architectures
    const archDir = path.join(templatesDir, 'stacks', stack, 'architectures', architecture);
    // Fallback to old structure if new doesn't exist
    const oldArchDir = path.join(templatesDir, 'architectures', stack, architecture);

    const sourceDir = fs.existsSync(archDir) ? archDir : oldArchDir;
    debugLog(options.debug, `Looking for architecture rules in: ${sourceDir}`);

    if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        debugLog(options.debug, `Found ${files.length} architecture files to process`);

        files.forEach(f => {
            const srcFile = path.join(sourceDir, f);
            // Write to stack folder with architecture prefix
            const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
            // Store in stack folder
            const stackFolder = path.join(targetRules, stack);
            fs.ensureDirSync(stackFolder); // Ensure stack folder exists
            const destFile = path.join(stackFolder, fileName);

            // Pass correct metadata including projectPath
            const meta = {
                projectPath: options.projectPath || '.',
                stack: stack,
                architecture: architecture,
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug
            };
            wrapMdToMdc(srcFile, destFile, meta);
            debugLog(options.debug, `Processed architecture file: ${f}`);
        });
        console.log(`${chalk.green('✅')} Applied ${chalk.cyan(stack)} ${chalk.magenta(architecture)} architecture rules`);
    } else {
        debugLog(options.debug, `Architecture directory does not exist: ${sourceDir}`);
    }
};

/**
 * Copy stack rules with version detection
 * @param {string} templatesDir - The templates directory
 * @param {string} stack - The stack name
 * @param {string} targetRules - The target rules directory
 * @param {string} projectPath - The project path
 * @param {Object} options - Additional options
 */
export const copyStack = async (templatesDir, stack, targetRules, projectPath, options = {}) => {
    console.log(`\n${chalk.blue('📦')} Processing rules for ${chalk.cyan(stack)}...`);
    debugLog(options.debug, `Target rules directory: ${targetRules}`);
    debugLog(options.debug, `Project path: ${projectPath}`);

    // Copy base rules
    const baseDir = path.join(templatesDir, 'stacks', stack, 'base');
    debugLog(options.debug, `Looking for base rules at: ${baseDir}`);

    // Check if base directory exists
    if (!fs.existsSync(baseDir)) {
        console.error(chalk.red(`❌ Base directory not found: ${baseDir}`));
    } else {
        debugLog(options.debug, `Found base directory with ${fs.readdirSync(baseDir).length} files`);
    }

    // Add version information to base rules
    let versionMeta = {};
    // Use selectedVersion if provided, otherwise detect
    const version = options.selectedVersion || versionDetector.detectVersion(stack, projectPath);
    if (version) {
        const versionRange = versionDetector.mapVersionToRange(stack, version, templatesDir) || `v${version}`;
        debugLog(options.debug, `Using version metadata: ${version} (${versionRange})`);
        versionMeta = {
            detectedVersion: version,
            versionRange: versionRange
        };
    } else {
        debugLog(options.debug, `No version detected for ${stack}, using base rules only`);
    }

    // Iterate over base files and add project path and version info
    if (fs.existsSync(baseDir)) {
        const baseFiles = fs.readdirSync(baseDir);
        debugLog(options.debug, `Processing ${baseFiles.length} base files for ${stack}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, stack);
        fs.ensureDirSync(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Store in stack folder with original filename
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            debugLog(options.debug, `Copying ${f} to ${fileName}`);

            // Custom metadata for each file
            const fileMeta = {
                ...versionMeta,
                stack,
                projectPath,
                debug: options.debug
            };

            wrapMdToMdc(srcFile, destFile, fileMeta);
        });
        console.log(`${chalk.green('✅')} Copied base rules for ${chalk.cyan(stack)}`);
    }

    // Determine appropriate version directory based on selected or detected version
    let versionDir;
    if (version) {
        versionDir = versionDetector.mapVersionToRange(stack, version, templatesDir);
    } else {
        versionDir = versionDetector.getVersionDirectory(templatesDir, stack, projectPath);
    }

    // Apply version-specific rules
    if (versionDir) {
        console.log(`${chalk.blue('🔄')} Applying version-specific rules from ${chalk.yellow(versionDir)}...`);
        copyVersionOverlay(templatesDir, stack, versionDir, targetRules, {
            projectPath,
            detectedVersion: version,
            versionRange: versionMeta.versionRange,
            debug: options.debug
        });
    } else {
        debugLog(options.debug, `No version-specific rules to apply for ${stack}`);
    }

    // Apply architecture-specific rules for Laravel
    if (stack === 'laravel' && options.architecture) {
        console.log(`${chalk.blue('🔄')} Applying architecture rules for ${chalk.magenta(options.architecture)}...`);
        copyArchitectureRules(templatesDir, stack, options.architecture, targetRules, {
            projectPath,
            detectedVersion: version,
            versionRange: versionMeta.versionRange,
            debug: options.debug
        });
    }

    console.log(`${chalk.green('✅')} Finished processing ${chalk.cyan(stack)}\n`);
}; 