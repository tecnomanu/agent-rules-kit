/**
 * Base Service for Agent Rules Kit
 * Provides shared functionality for all services
 */
import chalk from 'chalk';
import { promises as fsPromises } from 'fs';
import fs from 'fs-extra';

/**
 * Base service that provides shared utilities
 */
export class BaseService {
    constructor(options = {}) {
        this.debug = options.debug || false;
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.stackService = options.stackService;
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
     * Checks if a directory exists (async version)
     * @param {string} dir - Path of the directory to check
     * @returns {Promise<boolean>} - true if it exists, false if not
     */
    async directoryExistsAsync(dir) {
        try {
            const stats = await fsPromises.stat(dir);
            return stats.isDirectory();
        } catch (error) {
            return false;
        }
    }

    /**
     * Ensures a directory exists, creating it if necessary
     * @param {string} dir - Path of the directory to create
     */
    ensureDirectoryExists(dir) {
        fs.ensureDirSync(dir);
    }

    /**
     * Ensures a directory exists, creating it if necessary (async version)
     * @param {string} dir - Path of the directory to create
     * @returns {Promise<void>}
     */
    async ensureDirectoryExistsAsync(dir) {
        await fs.ensureDir(dir);
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
     * Gets the files in a directory (async version)
     * @param {string} dir - Directory path
     * @returns {Promise<Array<string>>} - List of files
     */
    async getFilesInDirectoryAsync(dir) {
        if (!await this.directoryExistsAsync(dir)) {
            this.debugLog(`Directory not found: ${dir}`);
            return [];
        }

        return await fsPromises.readdir(dir);
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
     * Reads a file (async version)
     * @param {string} file - Path of the file to read
     * @returns {Promise<string>} - File contents
     */
    async readFileAsync(file) {
        return await fsPromises.readFile(file, 'utf8');
    }

    /**
     * Optimized file reading that chooses appropriate method based on file size
     * @param {string} file - Path of the file to read
     * @returns {Promise<string>} - File contents
     */
    async readFileOptimized(file) {
        try {
            const stats = await fsPromises.stat(file);

            // For large files (>1MB), use streaming
            if (stats.size > 1024 * 1024) {
                this.debugLog(`Using stream for large file: ${file} (${stats.size} bytes)`);
                return new Promise((resolve, reject) => {
                    let content = '';
                    const stream = fs.createReadStream(file, { encoding: 'utf8' });

                    stream.on('data', (chunk) => {
                        content += chunk;
                    });
                    stream.on('end', () => {
                        resolve(content);
                    });
                    stream.on('error', reject);
                });
            }

            // For smaller files, read all at once
            return await fsPromises.readFile(file, 'utf8');
        } catch (error) {
            this.debugLog(`Error reading file ${file}: ${error.message}`);
            throw error;
        }
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
     * Writes a file (async version)
     * @param {string} file - Path of the file to write
     * @param {string} content - Content to write
     * @returns {Promise<void>}
     */
    async writeFileAsync(file, content) {
        await fs.outputFile(file, content);
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

    /**
     * Copies a file (async version)
     * @param {string} src - Source file
     * @param {string} dest - Destination
     * @returns {Promise<void>}
     */
    async copyFileAsync(src, dest) {
        await fs.copy(src, dest);
        this.debugLog(`File copied: ${chalk.green(dest)}`);
    }

    /**
     * Process files in batches for better memory management
     * @param {Array<any>} items - Array of items to process
     * @param {Function} processFn - Async function to process each item
     * @param {number} batchSize - Number of items to process at once
     * @returns {Promise<Array<any>>} - Results of processing
     */
    async processBatch(items, processFn, batchSize = 10) {
        const results = [];

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processFn(item))
            );
            results.push(...batchResults);

            // Allow event loop to handle other tasks between batches
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return results;
    }

    // Proxy methods to stackService if available
    getAvailableArchitectures(stack) {
        if (this.stackService) {
            return this.stackService.getAvailableArchitectures(stack);
        }
        return [];
    }

    getAvailableVersions(stack) {
        if (this.stackService) {
            return this.stackService.getAvailableVersions(stack);
        }
        return [];
    }

    mapVersionToRange(stack, version) {
        if (this.stackService) {
            return this.stackService.mapVersionToRange(stack, version);
        }
        return version;
    }

    getFormattedVersionName(stack, versionRange) {
        if (this.stackService) {
            return this.stackService.getFormattedVersionName(stack, versionRange);
        }
        return versionRange;
    }
} 