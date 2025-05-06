/**
 * Common stack helpers for Agent Rules Kit
 */
import fs from 'fs-extra';
import path from 'path';
import * as versionDetector from '../version-detector.js';
import { wrapMdToMdc } from './file-helpers.js';

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
        fs.readdirSync(overlayDir).forEach(f => {
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
                versionRange: options.versionRange
            };
            wrapMdToMdc(srcFile, destFile, meta);
        });
        console.log(`→ Applied ${stack} ${versionDir} overlay`);
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

    if (fs.existsSync(sourceDir)) {
        fs.readdirSync(sourceDir).forEach(f => {
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
                versionRange: options.versionRange
            };
            wrapMdToMdc(srcFile, destFile, meta);
        });
        console.log(`→ Applied ${stack} ${architecture} architecture rules`);
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
    console.log(`\n----- Copying rules for ${stack} -----`);
    console.log(`Target rules directory: ${targetRules}`);
    console.log(`Project path: ${projectPath}`);

    // Copy base rules
    const baseDir = path.join(templatesDir, 'stacks', stack, 'base');
    console.log(`Looking for base rules at: ${baseDir}`);

    // Check if base directory exists
    if (!fs.existsSync(baseDir)) {
        console.error(`Base directory not found: ${baseDir}`);
    } else {
        console.log(`Found base directory with ${fs.readdirSync(baseDir).length} files`);
    }

    // Add version information to base rules
    let versionMeta = {};
    // Use selectedVersion if provided, otherwise detect
    const version = options.selectedVersion || versionDetector.detectVersion(stack, projectPath);
    if (version) {
        const versionRange = versionDetector.mapVersionToRange(stack, version, templatesDir) || `v${version}`;
        console.log(`Using version metadata: ${version} (${versionRange})`);
        versionMeta = {
            detectedVersion: version,
            versionRange: versionRange
        };
    } else {
        console.log(`No version detected for ${stack}, using base rules only`);
    }

    // Iterate over base files and add project path and version info
    if (fs.existsSync(baseDir)) {
        const baseFiles = fs.readdirSync(baseDir);
        console.log(`Processing ${baseFiles.length} base files for ${stack}`);

        // Create stack directory if it doesn't exist
        const stackFolder = path.join(targetRules, stack);
        fs.ensureDirSync(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Store in stack folder with original filename
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            console.log(`Copying ${f} to ${fileName}`);

            // Custom metadata for each file
            const fileMeta = {
                ...versionMeta,
                stack,
                projectPath,
            };

            wrapMdToMdc(srcFile, destFile, fileMeta);
        });
        console.log(`Finished copying base rules for ${stack}`);
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
        console.log(`Applying version-specific rules from ${versionDir}`);
        copyVersionOverlay(templatesDir, stack, versionDir, targetRules, {
            projectPath,
            detectedVersion: version,
            versionRange: versionMeta.versionRange
        });
    } else {
        console.log(`No version-specific rules to apply for ${stack}`);
    }

    // Apply architecture-specific rules for Laravel
    if (stack === 'laravel' && options.architecture) {
        console.log(`Applying architecture rules for ${options.architecture}`);
        copyArchitectureRules(templatesDir, stack, options.architecture, targetRules, {
            projectPath,
            detectedVersion: version,
            versionRange: versionMeta.versionRange
        });
    }

    console.log(`----- Finished processing ${stack} -----\n`);
}; 