/**
 * File Service for Agent Rules Kit
 * Manages all file-related operations
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseService } from './base-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Service for handling file operations and rule processing
 */
export class FileService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.templatesDir = options.templatesDir || path.join(__dirname, '../../../templates');
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
     * Processes template variables in markdown content
     * @param {string} content - Markdown content
     * @param {Object} meta - Metadata for replacements
     * @returns {string} - Processed markdown content
     */
    processTemplateVariables(content, meta = {}) {
        let processedContent = content;

        // Normalize projectPath for variable replacement
        const projectPath = (!meta.projectPath || meta.projectPath === '.')
            ? './'
            : meta.projectPath;

        // Array of template variables and their corresponding values
        const templateVariables = [
            { value: meta?.detectedVersion, replace: 'detectedVersion' },
            { value: meta?.versionRange, replace: 'versionRange' },
            { value: projectPath, replace: 'projectPath' },
            { value: meta?.stack, replace: 'stack' }
        ];

        // Iterate over the array and replace placeholders with their values
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
     * Converts markdown to markdown with front matter
     * @param {string} src - Source file path
     * @param {string} destFile - Destination file path
     * @param {Object} meta - Metadata for front matter
     * @param {Object} config - Kit configuration
     */
    wrapMdToMdc(src, destFile, meta = {}, config = {}) {
        const md = this.readFile(src);

        // Get the filename without path
        const fileName = path.basename(src);

        // Get the directory structure to identify if it's a global rule or stack-specific
        const srcRelPath = src.replace(/\\/g, '/');
        const isGlobal = srcRelPath.includes('/global/');
        const stack = meta.stack || (srcRelPath.includes('/stacks/') ? srcRelPath.split('/stacks/')[1].split('/')[0] : null);

        this.debugLog(`Processing ${isGlobal ? 'global' : 'stack-specific'} file: ${fileName}`);

        // Initialize frontmatter with existing meta
        const frontMatter = { ...meta };

        // Remove debug property from frontMatter if it exists
        delete frontMatter.debug;

        // Normalize projectPath for glob replacements
        const projectPathPrefix = (frontMatter.projectPath === '.' || frontMatter.projectPath === '')
            ? ''
            : frontMatter.projectPath + '/';

        // Ensure projectPath is correctly set for template replacement
        if (!frontMatter.projectPath || frontMatter.projectPath === '.') {
            frontMatter.projectPath = './';
        }

        // Check global "always" rules regardless of location
        if (config.global?.always && config.global.always.includes(fileName)) {
            frontMatter.alwaysApply = true;
            this.debugLog(`Applied 'alwaysApply: true' to rule from global.always list: ${fileName}`);
        }

        // Add globs information
        if (isGlobal) {
            // For global rules
            frontMatter.globs = "**/*"; // Default to all files

            // Check if this file is in the "always" list
            if (config.global?.always && config.global.always.includes(fileName)) {
                frontMatter.alwaysApply = true;
                this.debugLog(`Applied 'alwaysApply: true' to global rule: ${fileName}`);
            } else {
                frontMatter.alwaysApply = false;
                this.debugLog(`Applied 'alwaysApply: false' to global rule: ${fileName}`);
            }
        } else if (stack && config[stack]) {
            this.debugLog(`Processing stack-specific rule for ${stack}: ${fileName}`);

            // For stack-specific rules
            if (config[stack].globs) {
                // Replace <root> with current project path
                const processedGlobs = config[stack].globs.map(glob =>
                    glob.replace(/<root>\//g, projectPathPrefix)
                );
                frontMatter.globs = processedGlobs.join(',');
                this.debugLog(`Applied default globs for ${stack}: ${frontMatter.globs}`);
            }

            // Check pattern rules to see if this file has specific globs
            if (config[stack].pattern_rules) {
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
                if (config[stack].architectures[arch].globs) {
                    // Replace <root> with current project path
                    const processedGlobs = config[stack].architectures[arch].globs.map(glob =>
                        glob.replace(/<root>\//g, projectPathPrefix)
                    );
                    frontMatter.globs = processedGlobs.join(',');
                    this.debugLog(`Applied architecture globs for ${arch}: ${frontMatter.globs}`);
                }

                // Check architecture-specific pattern rules
                if (config[stack].architectures[arch].pattern_rules) {
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

        // Process all template placeholders in markdown content
        const processedMd = this.processTemplateVariables(md, frontMatter);

        this.writeFile(destFile, this.addFrontMatter(processedMd, frontMatter));
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
        if (!this.directoryExists(tmplDir)) {
            this.debugLog(`Templates directory doesn't exist: ${tmplDir}`);
            return;
        }

        const files = this.getFilesInDirectory(tmplDir);
        this.debugLog(`Copying ${files.length} files from ${tmplDir} to ${destDir}`);

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
    }
} 