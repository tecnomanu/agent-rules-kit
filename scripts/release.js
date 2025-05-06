#!/usr/bin/env node
/**
 * Release script for Agent Rules Kit
 * 
 * Usage:
 *   node scripts/release.js [version]
 * 
 * If version is not provided, it will prompt for the type of release
 * (major, minor, patch) and calculate the new version accordingly.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read current package.json
const packagePath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define version bump types
const bumpTypes = {
    major: 0,
    minor: 1,
    patch: 2
};

/**
 * Calculate the next version based on the current version and bump type
 * @param {string} current - Current version (e.g., '1.2.3')
 * @param {string} type - Bump type ('major', 'minor', 'patch')
 * @returns {string} - Next version
 */
function calculateNextVersion(current, type) {
    const parts = current.split('.').map(Number);

    if (type === 'major') {
        return `${parts[0] + 1}.0.0`;
    } else if (type === 'minor') {
        return `${parts[0]}.${parts[1] + 1}.0`;
    } else if (type === 'patch') {
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }

    return current;
}

/**
 * Execute a command and return a Promise
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @returns {Promise<string>} - Command output
 */
function executeCommand(command, args) {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${command} ${args.join(' ')}`);

        const proc = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'inherit'],
            shell: process.platform === 'win32'
        });

        let output = '';
        proc.stdout.on('data', (data) => {
            output += data.toString();
            process.stdout.write(data.toString());
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Update the version in package.json
 * @param {string} newVersion - New version to set
 */
function updatePackageJson(newVersion) {
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, '\t') + '\n');
    console.log(`Updated package.json version to ${newVersion}`);
}

/**
 * Open the CHANGELOG.md file in the default editor
 */
async function openChangelog() {
    let editor = process.env.EDITOR || 'vi';
    if (process.platform === 'win32') {
        editor = 'notepad';
    } else if (process.platform === 'darwin') {
        editor = 'open -e';
    }

    const changelogPath = path.join(rootDir, 'CHANGELOG.md');

    console.log(`Opening CHANGELOG.md with ${editor}...`);
    try {
        await executeCommand(editor.split(' ')[0], [
            ...(editor.split(' ').slice(1)),
            changelogPath
        ]);
    } catch (error) {
        console.error('Failed to open CHANGELOG.md:', error);
        console.log('Please edit CHANGELOG.md manually.');
    }
}

/**
 * Create a Git commit with the version update
 * @param {string} version - New version
 */
async function createCommit(version) {
    try {
        // Add files
        await executeCommand('git', ['add', 'package.json', 'CHANGELOG.md']);

        // Create commit
        await executeCommand('git', ['commit', '-m', `release: version ${version}`]);

        // Create tag
        await executeCommand('git', ['tag', `-a`, `v${version}`, '-m', `Version ${version}`]);

        console.log(`Created commit and tag for version ${version}`);
    } catch (error) {
        console.error('Failed to create commit:', error);
        throw error;
    }
}

/**
 * Push changes to remote repository
 */
async function pushChanges() {
    try {
        // Push commit
        await executeCommand('git', ['push']);

        // Push tags
        await executeCommand('git', ['push', '--tags']);

        console.log('Pushed changes and tags to remote repository');
    } catch (error) {
        console.error('Failed to push changes:', error);
        throw error;
    }
}

/**
 * Publish package to npm
 */
async function publishToNpm() {
    try {
        await executeCommand('npm', ['publish']);
        console.log('Published to npm');
    } catch (error) {
        console.error('Failed to publish to npm:', error);
        throw error;
    }
}

/**
 * Main release process
 */
async function release() {
    try {
        // Get version from command line or prompt user
        let newVersion = process.argv[2];

        if (!newVersion) {
            console.log('\nSelect release type:');
            console.log('1. Major (x.0.0)');
            console.log('2. Minor (0.x.0)');
            console.log('3. Patch (0.0.x)');

            const answer = await new Promise((resolve) => {
                rl.question('Enter option (1-3) or type a specific version: ', resolve);
            });

            if (['1', '2', '3'].includes(answer)) {
                const types = ['major', 'minor', 'patch'];
                const type = types[Number(answer) - 1];
                newVersion = calculateNextVersion(currentVersion, type);
            } else if (/^\d+\.\d+\.\d+$/.test(answer)) {
                newVersion = answer;
            } else {
                console.error('Invalid input. Please provide a valid version or option.');
                rl.close();
                return;
            }
        }

        // Confirm the new version
        const confirmVersion = await new Promise((resolve) => {
            rl.question(`Release version ${newVersion}? (y/n): `, resolve);
        });

        if (confirmVersion.toLowerCase() !== 'y') {
            console.log('Release cancelled.');
            rl.close();
            return;
        }

        // Update package.json
        updatePackageJson(newVersion);

        // Ask to open CHANGELOG.md
        const openChangelogAnswer = await new Promise((resolve) => {
            rl.question('Do you want to open CHANGELOG.md for editing? (y/n): ', resolve);
        });

        if (openChangelogAnswer.toLowerCase() === 'y') {
            await openChangelog();
        }

        // Confirm CHANGELOG.md is updated
        const confirmChangelog = await new Promise((resolve) => {
            rl.question('Is CHANGELOG.md updated correctly? (y/n): ', resolve);
        });

        if (confirmChangelog.toLowerCase() !== 'y') {
            console.log('Please update CHANGELOG.md manually and then continue.');
            const continueAnswer = await new Promise((resolve) => {
                rl.question('Continue with release? (y/n): ', resolve);
            });

            if (continueAnswer.toLowerCase() !== 'y') {
                console.log('Release cancelled.');
                rl.close();
                return;
            }
        }

        // Create commit and tag
        await createCommit(newVersion);

        // Ask to push changes
        const pushAnswer = await new Promise((resolve) => {
            rl.question('Push changes to remote repository? (y/n): ', resolve);
        });

        if (pushAnswer.toLowerCase() === 'y') {
            await pushChanges();
        }

        // Ask to publish to npm
        const publishAnswer = await new Promise((resolve) => {
            rl.question('Publish to npm? (y/n): ', resolve);
        });

        if (publishAnswer.toLowerCase() === 'y') {
            await publishToNpm();
        }

        console.log(`\n🎉 Release ${newVersion} completed successfully!`);
    } catch (error) {
        console.error('Release process failed:', error);
    } finally {
        rl.close();
    }
}

// Run the release process
release(); 