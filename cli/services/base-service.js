/**
 * Base Service for Agent Rules Kit
 * Provides shared functionality for all services
 */
import chalk from 'chalk';
import fs from 'fs-extra';

/**
 * Base service that provides shared utilities
 */
export class BaseService {
    constructor(options = {}) {
        this.debug = options.debug || false;
    }

    /**
     * Debug log helper - Centralized for all services
     * @param {...any} args - Arguments to log
     */
    debugLog(...args) {
        if (this.debug) {
            console.log(chalk.gray('[DEBUG]'), ...args);
        }
    }

    /**
     * Checks if a directory exists
     * @param {string} dir - Path of the directory to check
     * @returns {boolean} - true if it exists, false if not
     */
    directoryExists(dir) {
        return fs.existsSync(dir);
    }

    /**
     * Ensures a directory exists, creating it if necessary
     * @param {string} dir - Path of the directory to create
     */
    ensureDirectoryExists(dir) {
        fs.ensureDirSync(dir);
    }

    /**
     * Gets the files in a directory
     * @param {string} dir - Directory path
     * @returns {Array<string>} - List of files
     */
    getFilesInDirectory(dir) {
        if (!this.directoryExists(dir)) {
            this.debugLog(`Directory not found: ${dir}`);
            return [];
        }

        return fs.readdirSync(dir);
    }

    /**
     * Reads a file
     * @param {string} file - Path of the file to read
     * @returns {string} - File contents
     */
    readFile(file) {
        return fs.readFileSync(file, 'utf8');
    }

    /**
     * Writes a file
     * @param {string} file - Path of the file to write
     * @param {string} content - Content to write
     */
    writeFile(file, content) {
        fs.outputFileSync(file, content);
        this.debugLog(`File created: ${chalk.green(file)}`);
    }

    /**
     * Copies a file
     * @param {string} src - Source file
     * @param {string} dest - Destination
     */
    copyFile(src, dest) {
        fs.copyFileSync(src, dest);
        this.debugLog(`File copied: ${chalk.green(dest)}`);
    }
} 