/**
 * File helpers for Agent Rules Kit
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadKitConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Debug mode flag - will be set by functions that receive debug option
let DEBUG_MODE = false;

/**
 * Debug log helper
 * @param {boolean} debug - Debug mode flag
 * @param {...any} args - Arguments to log
 */
const debugLog = (debug, ...args) => {
    if (debug || DEBUG_MODE) {
        console.log(chalk.gray('[DEBUG]'), ...args);
    }
};

/**
 * Add front matter to markdown files
 * @param {string} body - Markdown content
 * @param {Object} meta - Metadata for front matter
 * @returns {string} - Markdown with front matter
 */
export const addFrontMatter = (body, meta) =>
    `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}`;

/**
 * Process template placeholders in markdown content
 * @param {string} content - Markdown content
 * @param {Object} meta - Metadata for replacements
 * @returns {string} - Processed markdown content
 */
export const processTemplateVariables = (content, meta = {}) => {
    let processedContent = content;

    // Normalize projectPath for variable replacement
    const projectPath = (!meta.projectPath || meta.projectPath === '.')
        ? './'
        : meta.projectPath;

    // Array of template variables and their corresponding meta values
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
        }
    });

    return processedContent;
};

/**
 * Convert markdown to markdown with front matter
 * @param {string} src - Source file path
 * @param {string} destFile - Destination file path
 * @param {Object} meta - Metadata for front matter
 */
export const wrapMdToMdc = (src, destFile, meta = {}) => {
    // Set debug mode if provided in meta
    DEBUG_MODE = meta.debug || false;

    const md = fs.readFileSync(src, 'utf8');

    // Get the filename without path
    const fileName = path.basename(src);

    // Get the directory structure to identify if this is a global rule or stack-specific
    const srcRelPath = src.replace(/\\/g, '/');
    const isGlobal = srcRelPath.includes('/global/');
    const stack = meta.stack || (srcRelPath.includes('/stacks/') ? srcRelPath.split('/stacks/')[1].split('/')[0] : null);

    // Load kit config
    const templatesDir = path.join(__dirname, '../../templates');
    const kitConfig = loadKitConfig(templatesDir);

    // Initialize frontmatter with existing meta
    const frontMatter = { ...meta };

    // Remove debug property from frontMatter if exists
    delete frontMatter.debug;

    // Normalize projectPath for glob replacements
    const projectPathPrefix = (frontMatter.projectPath === '.' || frontMatter.projectPath === '')
        ? ''
        : frontMatter.projectPath + '/';

    // Make sure projectPath is properly set for template replacement
    if (!frontMatter.projectPath || frontMatter.projectPath === '.') {
        frontMatter.projectPath = './';
    }

    // Check for global always rules regardless of location
    if (kitConfig.global?.always && kitConfig.global.always.includes(fileName)) {
        frontMatter.alwaysApply = true;
        debugLog(DEBUG_MODE, `Applied 'alwaysApply: true' to rule from global.always list: ${fileName}`);
    }

    // Add globs information
    if (isGlobal) {
        // For global rules
        frontMatter.globs = "**/*"; // Default to all files

        // Check if this file is in the "always" list (redundant check, but kept for clarity)
        if (kitConfig.global?.always && kitConfig.global.always.includes(fileName)) {
            frontMatter.alwaysApply = true;
            debugLog(DEBUG_MODE, `Applied 'alwaysApply: true' to global rule: ${fileName}`);
        } else {
            frontMatter.alwaysApply = false;
            debugLog(DEBUG_MODE, `Applied 'alwaysApply: false' to global rule: ${fileName}`);
        }
    } else if (stack && kitConfig[stack]) {
        debugLog(DEBUG_MODE, `Processing stack-specific rule for ${stack}: ${fileName}`);

        // For stack-specific rules
        if (kitConfig[stack].globs) {
            // Replace <root> with actual project path
            const processedGlobs = kitConfig[stack].globs.map(glob =>
                glob.replace(/<root>\//g, projectPathPrefix)
            );
            frontMatter.globs = processedGlobs.join(',');
            debugLog(DEBUG_MODE, `Applied default globs for ${stack}: ${frontMatter.globs}`);
        }

        // Check pattern rules to see if this file has specific globs
        if (kitConfig[stack].pattern_rules) {
            for (const [pattern, rules] of Object.entries(kitConfig[stack].pattern_rules)) {
                // Convert to array if it's not already
                const rulesList = Array.isArray(rules) ? rules : [rules];

                // Check if this rule is in the list
                for (const rule of rulesList) {
                    const ruleParts = rule.split('/');
                    const ruleFileName = ruleParts[ruleParts.length - 1];

                    if (ruleFileName === fileName) {
                        // Replace <root> with actual project path in the pattern
                        const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                        frontMatter.globs = processedPattern;
                        debugLog(DEBUG_MODE, `Applied pattern-specific globs: ${processedPattern} for rule: ${fileName}`);
                        break;
                    }
                }
            }
        }

        // Check architecture-specific rules
        const archMatch = srcRelPath.match(/\/architectures\/([^/]+)\//);
        if (archMatch && archMatch[1] && kitConfig[stack].architectures?.[archMatch[1]]) {
            const arch = archMatch[1];
            debugLog(DEBUG_MODE, `Processing architecture-specific rule for ${stack}/${arch}: ${fileName}`);

            // Add architecture-specific globs
            if (kitConfig[stack].architectures[arch].globs) {
                // Replace <root> with actual project path
                const processedGlobs = kitConfig[stack].architectures[arch].globs.map(glob =>
                    glob.replace(/<root>\//g, projectPathPrefix)
                );
                frontMatter.globs = processedGlobs.join(',');
                debugLog(DEBUG_MODE, `Applied architecture globs for ${arch}: ${frontMatter.globs}`);
            }

            // Check architecture-specific pattern rules
            if (kitConfig[stack].architectures[arch].pattern_rules) {
                for (const [pattern, rules] of Object.entries(kitConfig[stack].architectures[arch].pattern_rules)) {
                    const rulesList = Array.isArray(rules) ? rules : [rules];
                    for (const rule of rulesList) {
                        const ruleParts = rule.split('/');
                        const ruleFileName = ruleParts[ruleParts.length - 1];

                        if (ruleFileName === fileName) {
                            // Replace <root> with actual project path in the pattern
                            const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                            frontMatter.globs = processedPattern;
                            debugLog(DEBUG_MODE, `Applied architecture pattern-specific globs: ${processedPattern} for rule: ${fileName}`);
                            break;
                        }
                    }
                }
            }
        }
    }

    // Process all template placeholders in markdown content
    const processedMd = processTemplateVariables(md, frontMatter);

    fs.outputFileSync(destFile, addFrontMatter(processedMd, frontMatter));
    debugLog(DEBUG_MODE, `Converted ${fileName} to MDC with frontmatter [globs: ${frontMatter.globs}, alwaysApply: ${frontMatter.alwaysApply}]`);
};

/**
 * Copy rule groups - this is only used for mirror docs now
 * @param {string} tmplDir - Template directory
 * @param {string} destDir - Destination directory
 * @param {Object} meta - Metadata for front matter
 */
export const copyRuleGroup = (tmplDir, destDir, meta = {}) => {
    // Set debug mode if provided in meta
    DEBUG_MODE = meta.debug || false;

    if (!fs.existsSync(tmplDir)) {
        return;
    }

    fs.readdirSync(tmplDir).forEach(f => {
        const srcFile = path.join(tmplDir, f);
        const destFile = path.join(destDir, f);

        // For documentation mirroring, we want to preserve the original file extension
        if (destDir.includes('docs/')) {
            // Read the source file, process variables, and write to destination
            const content = fs.readFileSync(srcFile, 'utf8');
            const processedContent = processTemplateVariables(content, meta);
            fs.outputFileSync(destFile, processedContent);
            debugLog(DEBUG_MODE, `Copied ${f} to documentation`);
        } else {
            // This should not normally be used for rules anymore
            // But kept for backward compatibility
            const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
            wrapMdToMdc(srcFile, mdcFile, meta);
        }
    });
}; 