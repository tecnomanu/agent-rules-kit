/**
 * File Service for Agent Rules Kit
 * Manages all file-related operations with performance optimizations
 */
import { promises as fsPromises } from 'fs';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseService } from './base-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Template cache implementation for faster template access
 */
class TemplateCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 100;
        this.ttl = options.ttl || 300000; // 5 minutes
    }

    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expiry) {
            return item.value;
        }
        return null;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Evict oldest item
            const oldestKey = [...this.cache.entries()]
                .sort((a, b) => a[1].expiry - b[1].expiry)[0][0];
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiry: Date.now() + this.ttl,
        });
    }

    clear() {
        this.cache.clear();
    }
}

/**
 * Service for handling file operations and rule processing
 * with optimized performance
 */
export class FileService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.templatesDir = options.templatesDir || path.join(__dirname, '../../../templates');
        this.templateCache = new TemplateCache({
            maxSize: options.cacheSize || 100,
            ttl: options.cacheTtl || 300000
        });
    }

    /**
     * Adds front matter to markdown content
     * @param {string} body - Markdown content
     * @param {Object} meta - Metadata for front matter
     * @returns {string} - Markdown with front matter
     */
    addFrontMatter(body, meta) {
        return `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}`;
    }

    /**
     * Process template variables in content
     * @param {string} content - The content to process
     * @param {Object} meta - Metadata for template variables
     * @returns {string} Processed content
     */
    processTemplateVariables(content, meta = {}) {
        if (!content) return content;

        let processedContent = content;

        // Normalizar projectPath si está vacío o es "."
        let projectPath = meta.projectPath;
        if (!projectPath || projectPath === '.') {
            projectPath = './';
        }

        // Define template variables to replace
        const templateVariables = [
            { value: meta.detectedVersion, replace: 'detectedVersion' },
            { value: meta.formattedVersionName || meta.versionRange, replace: 'versionRange' },
            { value: projectPath, replace: 'projectPath' },
            { value: meta.cursorPath, replace: 'cursorPath' },
            { value: meta.stack, replace: 'stack' }
        ];

        // Process each template variable
        templateVariables.forEach(({ value, replace }) => {
            if (value) {
                const regex = new RegExp(`\\{${replace}\\}`, 'g');
                processedContent = processedContent.replace(regex, value);
                this.debugLog(`Replaced {${replace}} with ${value}`);
            }
        });

        return processedContent;
    }

    /**
     * Optimized file read that handles large files more efficiently
     * @param {string} filePath - Path to the file
     * @returns {Promise<string>} - File contents
     */
    async readFileOptimized(filePath) {
        // Check cache first
        const cacheKey = `file:${filePath}`;
        const cachedContent = this.templateCache.get(cacheKey);
        if (cachedContent) {
            this.debugLog(`Cache hit for file: ${filePath}`);
            return cachedContent;
        }

        try {
            // Check file size to determine reading strategy
            const stats = await fsPromises.stat(filePath);

            let content;
            // For large files (>1MB), use streaming
            if (stats.size > 1024 * 1024) {
                this.debugLog(`Using stream for large file: ${filePath} (${stats.size} bytes)`);
                content = await new Promise((resolve, reject) => {
                    let data = '';
                    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

                    stream.on('data', (chunk) => { data += chunk; });
                    stream.on('end', () => { resolve(data); });
                    stream.on('error', reject);
                });
            } else {
                // For smaller files, read all at once
                content = await fsPromises.readFile(filePath, 'utf8');
            }

            // Cache the content
            this.templateCache.set(cacheKey, content);
            return content;
        } catch (error) {
            this.debugLog(`Error reading file ${filePath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Asynchronous file writer
     * @param {string} filePath - Path to write file
     * @param {string} content - Content to write
     * @returns {Promise<void>}
     */
    async writeFileAsync(filePath, content) {
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        await fsPromises.writeFile(filePath, content, 'utf8');
        this.debugLog(`File created: ${filePath}`);
    }

    /**
     * Check if file needs to be updated based on modification time
     * @param {string} srcFile - Source template file
     * @param {string} destFile - Destination rule file
     * @returns {Promise<boolean>} - True if update needed
     */
    async needsUpdate(srcFile, destFile) {
        try {
            if (!await fs.pathExists(destFile)) return true;

            const srcStat = await fsPromises.stat(srcFile);
            const destStat = await fsPromises.stat(destFile);

            return srcStat.mtime > destStat.mtime;
        } catch (error) {
            this.debugLog(`Error checking update status: ${error.message}`);
            return true; // If in doubt, update
        }
    }

    /**
     * Converts markdown to markdown with front matter
     * @param {string} src - Source file path
     * @param {string} destFile - Destination file path
     * @param {Object} meta - Metadata for front matter
     * @param {Object} config - Kit configuration
     */
    wrapMdToMdc(src, destFile, meta = {}, config = {}) {
        try {
            // For backward compatibility with tests, use synchronous methods
            const md = this.readFile(src);

            // Check if the md file already has frontmatter
            let existingFrontMatter = {};
            let contentWithoutFrontMatter = md;

            if (md.startsWith('---')) {
                const endIndex = md.indexOf('---', 3);
                if (endIndex !== -1) {
                    // Extract frontmatter
                    const frontMatterText = md.substring(3, endIndex).trim();
                    // Parse frontmatter lines into object
                    frontMatterText.split('\n').forEach(line => {
                        const [key, value] = line.split(':').map(part => part.trim());
                        if (key && value) {
                            try {
                                // Try to parse as JSON if it looks like an array or object
                                if (value.startsWith('[') || value.startsWith('{')) {
                                    existingFrontMatter[key] = JSON.parse(value);
                                } else {
                                    existingFrontMatter[key] = value;
                                }
                            } catch (e) {
                                existingFrontMatter[key] = value;
                            }
                        }
                    });
                    // Extract content without frontmatter
                    contentWithoutFrontMatter = md.substring(endIndex + 3).trim();
                    this.debugLog(`Found existing frontmatter in ${src}`);
                }
            }

            // Get the filename without path
            const fileName = path.basename(src);

            // Get the directory structure to identify if it's a global rule or stack-specific
            const srcRelPath = src.replace(/\\/g, '/');
            const isGlobal = srcRelPath.includes('/global/');
            const stack = meta.stack || (srcRelPath.includes('/stacks/') ? srcRelPath.split('/stacks/')[1].split('/')[0] : null);

            this.debugLog(`Processing ${isGlobal ? 'global' : 'stack-specific'} file: ${fileName}`);

            // Initialize frontmatter with existing meta and any existing frontmatter from the file
            const frontMatter = { ...meta, ...existingFrontMatter };

            // Remove debug property from frontMatter if it exists
            delete frontMatter.debug;

            // Normalize projectPath for glob replacements
            let projectPathPrefix = frontMatter.projectPath || './';
            if (projectPathPrefix === '.') {
                projectPathPrefix = './';
            }
            // Remove trailing slash and ensure one at the end
            projectPathPrefix = projectPathPrefix.replace(/\/$/, '') + '/';

            // Ensure projectPath is correctly set for template replacement
            if (!frontMatter.projectPath || frontMatter.projectPath === '.') {
                frontMatter.projectPath = './';
            }

            // Only set these if not already defined in the file's frontmatter
            if (!existingFrontMatter.alwaysApply && !existingFrontMatter.globs) {
                // Check global "always" rules regardless of location
                if (config.global?.always && config.global.always.includes(fileName)) {
                    frontMatter.alwaysApply = true;
                    this.debugLog(`Applied 'alwaysApply: true' to rule from global.always list: ${fileName}`);
                }

                // Add globs information if not already in the file
                if (isGlobal) {
                    // For global rules
                    frontMatter.globs = frontMatter.globs || "**/*"; // Default to all files

                    // Check if this file is in the "always" list
                    if (config.global?.always && config.global.always.includes(fileName)) {
                        frontMatter.alwaysApply = true;
                        this.debugLog(`Applied 'alwaysApply: true' to global rule: ${fileName}`);
                    } else if (frontMatter.alwaysApply === undefined) {
                        frontMatter.alwaysApply = false;
                        this.debugLog(`Applied 'alwaysApply: false' to global rule: ${fileName}`);
                    }
                } else if (stack && config[stack]) {
                    this.debugLog(`Processing stack-specific rule for ${stack}: ${fileName}`);

                    // For stack-specific rules
                    if (config[stack].globs && !frontMatter.globs) {
                        // Replace <root> with current project path
                        const processedGlobs = config[stack].globs.map(glob =>
                            glob.replace(/<root>\//g, projectPathPrefix)
                        );
                        frontMatter.globs = processedGlobs.join(',');
                        this.debugLog(`Applied default globs for ${stack}: ${frontMatter.globs}`);
                    }

                    // Check pattern rules to see if this file has specific globs
                    if (config[stack].pattern_rules && !frontMatter.globs) {
                        for (const [pattern, rules] of Object.entries(config[stack].pattern_rules)) {
                            // Convert to array if it's not already
                            const rulesList = Array.isArray(rules) ? rules : [rules];

                            // Check if this rule is in the list
                            for (const rule of rulesList) {
                                const ruleParts = rule.split('/');
                                const ruleFileName = ruleParts[ruleParts.length - 1];

                                if (ruleFileName === fileName) {
                                    // Replace <root> with current project path in the pattern
                                    const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                                    frontMatter.globs = processedPattern;
                                    this.debugLog(`Applied specific pattern globs: ${processedPattern} for rule: ${fileName}`);
                                    break;
                                }
                            }
                        }
                    }

                    // Check architecture-specific rules
                    const archMatch = srcRelPath.match(/\/architectures\/([^/]+)\//);
                    if (archMatch && archMatch[1] && config[stack].architectures?.[archMatch[1]]) {
                        const arch = archMatch[1];
                        this.debugLog(`Processing architecture-specific rule for ${stack}/${arch}: ${fileName}`);

                        // Add architecture-specific globs
                        if (config[stack].architectures[arch].globs && !frontMatter.globs) {
                            // Replace <root> with current project path
                            const processedGlobs = config[stack].architectures[arch].globs.map(glob =>
                                glob.replace(/<root>\//g, projectPathPrefix)
                            );
                            frontMatter.globs = processedGlobs.join(',');
                            this.debugLog(`Applied architecture globs for ${arch}: ${frontMatter.globs}`);
                        }

                        // Check architecture-specific pattern rules
                        if (config[stack].architectures[arch].pattern_rules && !frontMatter.globs) {
                            for (const [pattern, rules] of Object.entries(config[stack].architectures[arch].pattern_rules)) {
                                const rulesList = Array.isArray(rules) ? rules : [rules];
                                for (const rule of rulesList) {
                                    const ruleParts = rule.split('/');
                                    const ruleFileName = ruleParts[ruleParts.length - 1];

                                    if (ruleFileName === fileName) {
                                        // Replace <root> with current project path in the pattern
                                        const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                                        frontMatter.globs = processedPattern;
                                        this.debugLog(`Applied architecture-specific pattern globs: ${processedPattern} for rule: ${fileName}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Replace <root> placeholders in any existing globs
            if (frontMatter.globs) {
                frontMatter.globs = frontMatter.globs
                    .split(',')
                    .map(g => g.trim().replace(/<root>\//g, projectPathPrefix))
                    .join(',');
            }

            // Process all template placeholders in markdown content
            const processedMd = this.processTemplateVariables(contentWithoutFrontMatter, frontMatter);

            // For test compatibility, use synchronous write
            this.writeFile(destFile, this.addFrontMatter(processedMd, frontMatter));
            this.debugLog(`Created: ${destFile} with frontmatter [globs: ${frontMatter.globs}, alwaysApply: ${frontMatter.alwaysApply || false}]`);

            // Also call the async version for future features
            this.wrapMdToMdcAsync(src, destFile, meta, config)
                .catch(err => this.debugLog(`Error in wrapMdToMdcAsync: ${err.message}`));
        } catch (error) {
            this.debugLog(`Error in wrapMdToMdc: ${error.message}`);
        }
    }

    /**
     * Asynchronously converts markdown to markdown with front matter
     * @param {string} src - Source file path
     * @param {string} destFile - Destination file path
     * @param {Object} meta - Metadata for front matter
     * @param {Object} config - Kit configuration
     * @returns {Promise<void>}
     */
    async wrapMdToMdcAsync(src, destFile, meta = {}, config = {}) {
        // Skip if no update needed
        if (!await this.needsUpdate(src, destFile)) {
            this.debugLog(`Skipping unchanged file: ${destFile}`);
            return;
        }

        const md = await this.readFileOptimized(src);

        // Check if the md file already has frontmatter
        let existingFrontMatter = {};
        let contentWithoutFrontMatter = md;

        if (md.startsWith('---')) {
            const endIndex = md.indexOf('---', 3);
            if (endIndex !== -1) {
                // Extract frontmatter
                const frontMatterText = md.substring(3, endIndex).trim();
                // Parse frontmatter lines into object
                frontMatterText.split('\n').forEach(line => {
                    const [key, value] = line.split(':').map(part => part.trim());
                    if (key && value) {
                        try {
                            // Try to parse as JSON if it looks like an array or object
                            if (value.startsWith('[') || value.startsWith('{')) {
                                existingFrontMatter[key] = JSON.parse(value);
                            } else {
                                existingFrontMatter[key] = value;
                            }
                        } catch (e) {
                            existingFrontMatter[key] = value;
                        }
                    }
                });
                // Extract content without frontmatter
                contentWithoutFrontMatter = md.substring(endIndex + 3).trim();
                this.debugLog(`Found existing frontmatter in ${src}`);
            }
        }

        // Get the filename without path
        const fileName = path.basename(src);

        // Get the directory structure to identify if it's a global rule or stack-specific
        const srcRelPath = src.replace(/\\/g, '/');
        const isGlobal = srcRelPath.includes('/global/');
        const stack = meta.stack || (srcRelPath.includes('/stacks/') ? srcRelPath.split('/stacks/')[1].split('/')[0] : null);

        this.debugLog(`Processing ${isGlobal ? 'global' : 'stack-specific'} file: ${fileName}`);

        // Initialize frontmatter with existing meta and any existing frontmatter from the file
        const frontMatter = { ...meta, ...existingFrontMatter };

        // Remove debug property from frontMatter if it exists
        delete frontMatter.debug;

        // Normalize projectPath for glob replacements
        let projectPathPrefix = frontMatter.projectPath || './';
        if (projectPathPrefix === '.') {
            projectPathPrefix = './';
        }
        // Remove trailing slash and ensure one at the end
        projectPathPrefix = projectPathPrefix.replace(/\/$/, '') + '/';

        // Ensure projectPath is correctly set for template replacement
        if (!frontMatter.projectPath || frontMatter.projectPath === '.') {
            frontMatter.projectPath = './';
        }

        // Only set these if not already defined in the file's frontmatter
        if (!existingFrontMatter.alwaysApply && !existingFrontMatter.globs) {
            // Check global "always" rules regardless of location
            if (config.global?.always && config.global.always.includes(fileName)) {
                frontMatter.alwaysApply = true;
                this.debugLog(`Applied 'alwaysApply: true' to rule from global.always list: ${fileName}`);
            }

            // Add globs information if not already in the file
            if (isGlobal) {
                // For global rules
                frontMatter.globs = frontMatter.globs || "**/*"; // Default to all files

                // Check if this file is in the "always" list
                if (config.global?.always && config.global.always.includes(fileName)) {
                    frontMatter.alwaysApply = true;
                    this.debugLog(`Applied 'alwaysApply: true' to global rule: ${fileName}`);
                } else if (frontMatter.alwaysApply === undefined) {
                    frontMatter.alwaysApply = false;
                    this.debugLog(`Applied 'alwaysApply: false' to global rule: ${fileName}`);
                }
            } else if (stack && config[stack]) {
                this.debugLog(`Processing stack-specific rule for ${stack}: ${fileName}`);

                // For stack-specific rules
                if (config[stack].globs && !frontMatter.globs) {
                    // Replace <root> with current project path
                    const processedGlobs = config[stack].globs.map(glob =>
                        glob.replace(/<root>\//g, projectPathPrefix)
                    );
                    frontMatter.globs = processedGlobs.join(',');
                    this.debugLog(`Applied default globs for ${stack}: ${frontMatter.globs}`);
                }

                // Check pattern rules to see if this file has specific globs
                if (config[stack].pattern_rules && !frontMatter.globs) {
                    for (const [pattern, rules] of Object.entries(config[stack].pattern_rules)) {
                        // Convert to array if it's not already
                        const rulesList = Array.isArray(rules) ? rules : [rules];

                        // Check if this rule is in the list
                        for (const rule of rulesList) {
                            const ruleParts = rule.split('/');
                            const ruleFileName = ruleParts[ruleParts.length - 1];

                            if (ruleFileName === fileName) {
                                // Replace <root> with current project path in the pattern
                                const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                                frontMatter.globs = processedPattern;
                                this.debugLog(`Applied specific pattern globs: ${processedPattern} for rule: ${fileName}`);
                                break;
                            }
                        }
                    }
                }

                // Check architecture-specific rules
                const archMatch = srcRelPath.match(/\/architectures\/([^/]+)\//);
                if (archMatch && archMatch[1] && config[stack].architectures?.[archMatch[1]]) {
                    const arch = archMatch[1];
                    this.debugLog(`Processing architecture-specific rule for ${stack}/${arch}: ${fileName}`);

                    // Add architecture-specific globs
                    if (config[stack].architectures[arch].globs && !frontMatter.globs) {
                        // Replace <root> with current project path
                        const processedGlobs = config[stack].architectures[arch].globs.map(glob =>
                            glob.replace(/<root>\//g, projectPathPrefix)
                        );
                        frontMatter.globs = processedGlobs.join(',');
                        this.debugLog(`Applied architecture globs for ${arch}: ${frontMatter.globs}`);
                    }

                    // Check architecture-specific pattern rules
                    if (config[stack].architectures[arch].pattern_rules && !frontMatter.globs) {
                        for (const [pattern, rules] of Object.entries(config[stack].architectures[arch].pattern_rules)) {
                            const rulesList = Array.isArray(rules) ? rules : [rules];
                            for (const rule of rulesList) {
                                const ruleParts = rule.split('/');
                                const ruleFileName = ruleParts[ruleParts.length - 1];

                                if (ruleFileName === fileName) {
                                    // Replace <root> with current project path in the pattern
                                    const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                                    frontMatter.globs = processedPattern;
                                    this.debugLog(`Applied architecture-specific pattern globs: ${processedPattern} for rule: ${fileName}`);
                                    break;
                                }
                            }
                        }
                    }
                }
                }
            }

        // Replace <root> placeholders in any existing globs
        if (frontMatter.globs) {
            frontMatter.globs = frontMatter.globs
                .split(',')
                .map(g => g.trim().replace(/<root>\//g, projectPathPrefix))
                .join(',');
        }

        // Process all template placeholders in markdown content
        const processedMd = this.processTemplateVariables(contentWithoutFrontMatter, frontMatter);

        await this.writeFileAsync(destFile, this.addFrontMatter(processedMd, frontMatter));
        this.debugLog(`Created: ${destFile} with frontmatter [globs: ${frontMatter.globs}, alwaysApply: ${frontMatter.alwaysApply || false}]`);
    }

    /**
     * Copies rule group - mainly used for duplicating documentation
     * @param {string} tmplDir - Templates directory
     * @param {string} destDir - Destination directory
     * @param {Object} meta - Metadata for front matter
     * @param {Object} config - Kit configuration
     */
    copyRuleGroup(tmplDir, destDir, meta = {}, config = {}) {
        try {
            if (!this.directoryExists(tmplDir)) {
                this.debugLog(`Templates directory doesn't exist: ${tmplDir}`);
                return;
            }

            const files = this.getFilesInDirectory(tmplDir);
            this.debugLog(`Copying ${files.length} files from ${tmplDir} to ${destDir}`);

            // Ensure destination directory exists
            try {
                this.ensureDirectoryExists(destDir);
            } catch (error) {
                // Fallback if ensureDirectoryExists fails
                this.debugLog(`ensureDirectoryExists failed, continuing without it: ${error.message}`);
            }

            files.forEach(f => {
                const srcFile = path.join(tmplDir, f);
                const destFile = path.join(destDir, f);

                // For documentation duplication, we want to preserve the original file extension
                if (destDir.includes('docs/')) {
                    // Read the source file, process variables and write to destination
                    const content = this.readFile(srcFile);
                    const processedContent = this.processTemplateVariables(content, meta);
                    this.writeFile(destFile, processedContent);
                    this.debugLog(`Created mirror document: ${destFile}`);
                } else {
                    // This shouldn't normally be used for rules but is kept for compatibility
                    const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
                    this.wrapMdToMdc(srcFile, mdcFile, meta, config);
                }
            });

            this.debugLog(`Copied ${files.length} files to ${destDir}`);

            // Also call the async version for future functionality
            this.copyRuleGroupAsync(tmplDir, destDir, meta, config)
                .catch(err => this.debugLog(`Error in copyRuleGroupAsync: ${err.message}`));
        } catch (error) {
            this.debugLog(`Error in copyRuleGroup: ${error.message}`);
        }
    }

    /**
     * Asynchronously copies rule group with optimized processing
     * @param {string} tmplDir - Templates directory
     * @param {string} destDir - Destination directory
     * @param {Object} meta - Metadata for front matter
     * @param {Object} config - Kit configuration
     * @returns {Promise<void>}
     */
    async copyRuleGroupAsync(tmplDir, destDir, meta = {}, config = {}) {
        if (!await fs.pathExists(tmplDir)) {
            this.debugLog(`Templates directory doesn't exist: ${tmplDir}`);
            return;
        }

        try {
            const files = await fsPromises.readdir(tmplDir);
            this.debugLog(`Copying ${files.length} files from ${tmplDir} to ${destDir}`);

            // Create destination directory
            await fs.ensureDir(destDir);

            // Process files in batches for better memory usage
            const batchSize = 10;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);

                // Process batch in parallel
                await Promise.all(batch.map(async (f) => {
                    const srcFile = path.join(tmplDir, f);
                    const destFile = path.join(destDir, f);

                    try {
                        // For documentation duplication, preserve the original file extension
                        if (destDir.includes('docs/')) {
                            // Read the source file, process variables and write to destination
                            const content = await this.readFileOptimized(srcFile);
                            const processedContent = this.processTemplateVariables(content, meta);
                            await this.writeFileAsync(destFile, processedContent);
                            this.debugLog(`Created mirror document: ${destFile}`);
                        } else {
                            // This shouldn't normally be used for rules but is kept for compatibility
                            const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
                            await this.wrapMdToMdcAsync(srcFile, mdcFile, meta, config);
                        }
                    } catch (error) {
                        this.debugLog(`Error processing file ${f}: ${error.message}`);
                    }
                }));

                // Allow event loop to handle other tasks between batches
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            this.debugLog(`Copied ${files.length} files to ${destDir}`);
        } catch (error) {
            this.debugLog(`Error in copyRuleGroupAsync: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gets list of files in a directory asynchronously
     * @param {string} dir - Directory path
     * @returns {Promise<Array<string>>} - List of files
     */
    async getFilesAsync(dir) {
        try {
            return await fsPromises.readdir(dir);
        } catch (error) {
            this.debugLog(`Error reading directory ${dir}: ${error.message}`);
            return [];
        }
    }

    /**
     * Clears the template cache
     */
    clearCache() {
        this.templateCache.clear();
        this.debugLog('Template cache cleared');
    }

    /**
     * Removes frontmatter from an MDC file for external usage
     * @param {string} mdcContent - Content of MDC file with frontmatter
     * @returns {string} - Clean MD content without frontmatter
     */
    unwrapMdcToMd(mdcContent) {
        try {
            // Check if the content has frontmatter (between --- markers)
            if (mdcContent.startsWith('---')) {
                const endIndex = mdcContent.indexOf('---', 3);
                if (endIndex !== -1) {
                    // Extract only the content after the second --- marker
                    return mdcContent.substring(endIndex + 3).trim();
                }
            }
            // If no frontmatter found, return the original content
            return mdcContent;
        } catch (error) {
            this.debugLog(`Error removing frontmatter: ${error.message}`);
            return mdcContent;
        }
    }

    /**
     * Exports an MDC file to MD by removing the frontmatter
     * @param {string} mdcFilePath - Path to MDC file
     * @param {string} mdFilePath - Path to output MD file
     * @returns {Promise<void>}
     */
    async exportMdcToMd(mdcFilePath, mdFilePath) {
        try {
            const mdcContent = await this.readFileOptimized(mdcFilePath);
            const mdContent = this.unwrapMdcToMd(mdcContent);
            await this.writeFileAsync(mdFilePath, mdContent);
            this.debugLog(`Exported ${mdcFilePath} to ${mdFilePath}`);
        } catch (error) {
            this.debugLog(`Error exporting MDC to MD: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extracts frontmatter from markdown content
     * @param {string} content - Markdown content with optional frontmatter
     * @returns {Object} - Object with frontmatter and content properties
     */
    extractFrontmatter(content) {
        if (!content || !content.trim().startsWith('---')) {
            return { frontmatter: {}, content };
        }

        try {
            // Find the end of frontmatter
            const endIndex = content.indexOf('---', 3);
            if (endIndex === -1) {
                return { frontmatter: {}, content };
            }

            // Extract frontmatter and content
            const frontmatterText = content.substring(3, endIndex).trim();
            const contentWithoutFrontmatter = content.substring(endIndex + 3).trim();

            // Parse frontmatter
            const frontmatter = {};
            const lines = frontmatterText.split('\n');

            for (const line of lines) {
                if (!line.trim() || !line.includes(':')) continue;

                // Split at first colon
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                // Handle arrays
                if (value.startsWith('[') && value.endsWith(']')) {
                    // Remove brackets and split by commas, then trim each value
                    const arrayValues = value.substring(1, value.length - 1)
                        .split(',')
                        .map(item => {
                            const trimmed = item.trim();
                            // Remove quotes if present
                            if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
                                (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                                return trimmed.substring(1, trimmed.length - 1);
                            }
                            return trimmed;
                        })
                        .filter(Boolean); // Remove empty entries

                    frontmatter[key] = arrayValues;
                    continue;
                }

                // Handle boolean values
                if (value === 'true') {
                    frontmatter[key] = true;
                    continue;
                } else if (value === 'false') {
                    frontmatter[key] = false;
                    continue;
                }

                // Handle quoted strings
                if ((value.startsWith("'") && value.endsWith("'")) ||
                    (value.startsWith('"') && value.endsWith('"'))) {
                    frontmatter[key] = value.substring(1, value.length - 1);
                } else {
                    frontmatter[key] = value;
                }
            }

            return {
                frontmatter,
                content: contentWithoutFrontmatter
            };
        } catch (error) {
            this.debugLog(`Error extracting frontmatter: ${error.message}`);
            return { frontmatter: {}, content };
        }
    }

    /**
     * Combines multiple markdown files with the same base name
     * @param {string[]} filePaths - Array of file paths to combine
     * @param {Object} meta - Metadata for template processing
     * @returns {Promise<Object>} - Object with combined frontmatter and content
     */
    async combineMdFiles(filePaths, meta = {}) {
        if (!filePaths || filePaths.length === 0) {
            throw new Error('No file paths provided for combination');
        }

        // If there's only one file, just process it directly
        if (filePaths.length === 1) {
            try {
                // Check if file exists
                if (!await this.pathExists(filePaths[0])) {
                    throw new Error(`File does not exist: ${filePaths[0]}`);
                }

                // Read and process the file
                const content = await this.readFileOptimized(filePaths[0]);
                const processed = this.processTemplateVariables(content, meta);
                const { frontmatter, content: extractedContent } = this.extractFrontmatter(processed);

                return { frontmatter, content: extractedContent };
            } catch (error) {
                this.debugLog(`Error processing single file: ${error.message}`);
                throw error;
            }
        }

        // Process multiple files
        let combinedFrontmatter = {};
        let combinedContent = '';

        // Classify files into categories for proper override ordering
        const categories = {
            base: filePaths.filter(path => path.includes('/base/')),
            architecture: filePaths.filter(path => path.includes('/architectures/')),
            version: filePaths.filter(path => path.includes('/v'))
        };

        // Define processing order to ensure version-specific overrides base
        const processingOrder = [
            ...categories.base,
            ...categories.architecture,
            ...categories.version
        ];

        // Process each file in order
        for (let i = 0; i < processingOrder.length; i++) {
            const filePath = processingOrder[i];

            try {
                // Check if file exists
                if (!await this.pathExists(filePath)) {
                    this.debugLog(`Skipping non-existent file: ${filePath}`);
                    continue;
                }

                // Read and process the file
                const content = await this.readFileOptimized(filePath);
                const processed = this.processTemplateVariables(content, meta);
                const { frontmatter, content: extractedContent } = this.extractFrontmatter(processed);

                // Add file content with appropriate header
                if (i > 0) {
                    const fileName = path.basename(filePath, path.extname(filePath));
                    const fileType = filePath.includes('/architectures/')
                        ? 'Architecture specific'
                        : filePath.includes('/v')
                            ? 'Version specific'
                            : 'Base';

                    combinedContent += `\n\n## ${fileName} (${fileType})\n\n`;
                }

                combinedContent += extractedContent;

                // Merge frontmatter - later files override earlier ones
                combinedFrontmatter = { ...combinedFrontmatter, ...frontmatter };
            } catch (error) {
                this.debugLog(`Error processing file ${filePath}: ${error.message}`);
                // Continue with other files
            }
        }

        return {
            frontmatter: combinedFrontmatter,
            content: combinedContent.trim()
        };
    }

    /**
     * Utility method to check if a file exists
     * This can be easily mocked in tests
     * @param {string} path - Path to check
     * @returns {Promise<boolean>} - True if exists
     */
    async pathExists(path) {
        try {
            return await fs.pathExists(path);
        } catch (error) {
            this.debugLog(`Error checking if path exists: ${error.message}`);
            return false;
        }
    }
} 