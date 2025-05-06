#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { wrapMdToMdc } from './cli/utils/file-helpers.js';
import { copyStack } from './cli/utils/stack-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, 'templates');

async function testCLI() {
    console.log('🧪 Testing Agent Rules Kit with predefined values');

    // Predefined settings
    const settings = {
        selected: 'laravel',
        global: true,
        root: 'testing',
        projectPath: '.',
        mirrorDocs: false,
        selectedVersion: 12,
        architecture: 'standard'
    };

    console.log('Test settings:', settings);

    // Clean up previous test files but keep the testing directory
    const cursorDir = path.join(process.cwd(), settings.root, '.cursor');
    if (fs.existsSync(cursorDir)) {
        console.log(`Cleaning up previous test files in ${cursorDir}`);
        fs.removeSync(cursorDir);
    } else {
        console.log(`Creating testing directory structure`);
        fs.ensureDirSync(path.join(process.cwd(), settings.root));
    }

    // Ensure target directory exists
    const targetRules = path.join(process.cwd(), settings.root, '.cursor', 'rules', 'rules-kit');
    fs.ensureDirSync(targetRules);

    // Copy global rules
    if (settings.global) {
        const globalDir = path.join(templatesDir, 'global');
        const globalFolder = path.join(targetRules, 'global');
        fs.ensureDirSync(globalFolder);

        if (fs.existsSync(globalDir)) {
            fs.readdirSync(globalDir).forEach(f => {
                const srcFile = path.join(globalDir, f);
                const destFile = path.join(globalFolder, `${f}`.replace(/\.md$/, '.mdc'));
                const meta = {
                    projectPath: settings.projectPath,
                };
                wrapMdToMdc(srcFile, destFile, meta);
            });
            console.log(`→ Applied global rules`);
        }
    }

    // Copy stack rules
    await copyStack(
        templatesDir,
        settings.selected,
        targetRules,
        settings.projectPath,
        {
            architecture: settings.architecture,
            selectedVersion: settings.selectedVersion
        }
    );

    console.log('\n✅ Test completed. Check the output files in:', targetRules);
}

testCLI().catch(err => {
    console.error('Error:', err);
    process.exit(1);
}); 