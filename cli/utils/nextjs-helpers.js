/**
 * Next.js specific helpers for Agent Rules Kit
 */
import fs from 'fs-extra';
import path from 'path';
import { wrapMdToMdc } from './file-helpers.js';

/**
 * Copy architecture-specific rules for Next.js
 * @param {string} templatesDir - The templates directory
 * @param {string} architecture - The architecture (app, pages, or hybrid)
 * @param {string} targetRules - The target rules directory
 */
export const copyArchitectureRules = (templatesDir, architecture, targetRules) => {
    if (!architecture) return;

    const architecturePaths = [];
    if (architecture === 'app' || architecture === 'hybrid') {
        architecturePaths.push({
            path: path.join(templatesDir, 'stacks/nextjs/architectures/app'),
            type: 'app'
        });
    }
    if (architecture === 'pages' || architecture === 'hybrid') {
        architecturePaths.push({
            path: path.join(templatesDir, 'stacks/nextjs/architectures/pages'),
            type: 'pages'
        });
    }

    architecturePaths.forEach(({ path: dirPath, type }) => {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(f => {
                const srcFile = path.join(dirPath, f);
                // Write to architecture subfolder with architecture prefix
                const fileName = `architecture-${type}-${f}`.replace(/\.md$/, '.mdc');
                // Store in nextjs folder
                const stackFolder = path.join(targetRules, 'nextjs');
                fs.ensureDirSync(stackFolder); // Ensure stack folder exists
                const destFile = path.join(stackFolder, fileName);
                wrapMdToMdc(srcFile, destFile);
            });
            console.log(`→ Applied Next.js ${type} architecture rules`);
        }
    });
}; 