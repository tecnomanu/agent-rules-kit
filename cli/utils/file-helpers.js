/**
 * File helpers for Agent Rules Kit
 */
import fs from 'fs-extra';
import path from 'path';

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

    // Array of template variables and their corresponding meta values
    const templateVariables = [
        { value: meta?.detectedVersion, replace: 'detectedVersion' },
        { value: meta?.versionRange, replace: 'versionRange' },
        { value: meta?.projectPath ?? '.', replace: 'projectPath' },
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
    const md = fs.readFileSync(src, 'utf8');

    // Process all template placeholders in markdown content
    const processedMd = processTemplateVariables(md, meta);

    fs.outputFileSync(destFile, addFrontMatter(processedMd, meta));
};

/**
 * Copy rule groups - this is only used for mirror docs now
 * @param {string} tmplDir - Template directory
 * @param {string} destDir - Destination directory
 * @param {Object} meta - Metadata for front matter
 */
export const copyRuleGroup = (tmplDir, destDir, meta = {}) => {
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
        } else {
            // This should not normally be used for rules anymore
            // But kept for backward compatibility
            const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
            wrapMdToMdc(srcFile, mdcFile, meta);
        }
    });
}; 