/**
 * React specific helpers for Agent Rules Kit
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
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
 * Copy architecture-specific rules for React
 * @param {string} templatesDir - The templates directory
 * @param {string} architecture - The architecture (standard, atomic, feature-sliced, etc.)
 * @param {string} targetRules - The target rules directory
 * @param {Object} options - Additional options
 */
export const copyArchitectureRules = (templatesDir, architecture, targetRules, options = {}) => {
    if (!architecture) return;

    debugLog(options.debug, `Looking for React architecture rules: ${architecture}`);

    const architecturePath = path.join(templatesDir, 'stacks/react/architectures', architecture);

    if (fs.existsSync(architecturePath)) {
        const files = fs.readdirSync(architecturePath);
        debugLog(options.debug, `Found ${files.length} architecture files for React ${architecture}`);

        files.forEach(f => {
            const srcFile = path.join(architecturePath, f);
            // Write to architecture subfolder with architecture prefix
            const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
            // Store in react folder
            const stackFolder = path.join(targetRules, 'react');
            fs.ensureDirSync(stackFolder); // Ensure stack folder exists
            const destFile = path.join(stackFolder, fileName);

            const meta = {
                projectPath: options.projectPath || '.',
                stack: 'react',
                architecture: architecture,
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug
            };

            wrapMdToMdc(srcFile, destFile, meta);
            debugLog(options.debug, `Processed React architecture file: ${f}`);
        });
        console.log(`${chalk.green('✅')} Applied ${chalk.cyan('React')} ${chalk.magenta(architecture)} architecture rules`);
    } else {
        debugLog(options.debug, `React architecture directory not found: ${architecturePath}`);
    }
};

/**
 * Copy testing-related rules for React
 * @param {string} templatesDir - The templates directory
 * @param {string} targetRules - The target rules directory
 * @param {Object} options - Additional options
 */
export const copyTestingRules = (templatesDir, targetRules, options = {}) => {
    const testingPath = path.join(templatesDir, 'stacks/react/testing');

    if (fs.existsSync(testingPath)) {
        const files = fs.readdirSync(testingPath);
        debugLog(options.debug, `Found ${files.length} testing files for React`);

        files.forEach(f => {
            const srcFile = path.join(testingPath, f);
            // Add testing prefix to filename
            const fileName = `testing-${f}`.replace(/\.md$/, '.mdc');
            // Store in react folder
            const stackFolder = path.join(targetRules, 'react');
            fs.ensureDirSync(stackFolder);
            const destFile = path.join(stackFolder, fileName);

            const meta = {
                projectPath: options.projectPath || '.',
                stack: 'react',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug
            };

            wrapMdToMdc(srcFile, destFile, meta);
            debugLog(options.debug, `Processed React testing file: ${f}`);
        });
        console.log(`${chalk.green('✅')} Applied ${chalk.cyan('React')} testing rules`);
    } else {
        debugLog(options.debug, `React testing directory not found: ${testingPath}`);
    }
};

/**
 * Copy state management rules for React
 * @param {string} templatesDir - The templates directory
 * @param {string} stateManagement - The state management library (redux, mobx, context, recoil, etc.)
 * @param {string} targetRules - The target rules directory
 * @param {Object} options - Additional options
 */
export const copyStateManagementRules = (templatesDir, stateManagement, targetRules, options = {}) => {
    if (!stateManagement) return;

    debugLog(options.debug, `Looking for React state management rules: ${stateManagement}`);

    const statePath = path.join(templatesDir, 'stacks/react/state-management', stateManagement);

    if (fs.existsSync(statePath)) {
        const files = fs.readdirSync(statePath);
        debugLog(options.debug, `Found ${files.length} state management files for React ${stateManagement}`);

        files.forEach(f => {
            const srcFile = path.join(statePath, f);
            // Add state management prefix to filename
            const fileName = `state-${stateManagement}-${f}`.replace(/\.md$/, '.mdc');
            // Store in react folder
            const stackFolder = path.join(targetRules, 'react');
            fs.ensureDirSync(stackFolder);
            const destFile = path.join(stackFolder, fileName);

            const meta = {
                projectPath: options.projectPath || '.',
                stack: 'react',
                stateManagement: stateManagement,
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug
            };

            wrapMdToMdc(srcFile, destFile, meta);
            debugLog(options.debug, `Processed React state management file: ${f}`);
        });
        console.log(`${chalk.green('✅')} Applied ${chalk.cyan('React')} ${chalk.yellow(stateManagement)} state management rules`);
    } else {
        debugLog(options.debug, `React state management directory not found: ${statePath}`);
    }
}; 