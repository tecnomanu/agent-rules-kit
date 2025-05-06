/**
 * Framework version detection for Agent Rules Kit
 */
import fs from 'fs-extra';
import path from 'path';

/**
 * Get version ranges from kit-config.json
 * @param {string} templatesDir - The templates directory path
 * @returns {Object} - The version ranges configuration
 */
export const getVersionRangesConfig = (templatesDir) => {
    try {
        const configPath = path.join(templatesDir, 'kit-config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return config.version_ranges || {};
        }
    } catch (error) {
        console.error('Error loading version ranges from config:', error);
    }

    // Fallback default ranges if config can't be loaded
    return {
        laravel: {
            8: 'v8-9',
            9: 'v8-9',
            10: 'v10-11',
            11: 'v10-11',
            12: 'v12',
        },
        nextjs: {
            12: 'v12',
            13: 'v13',
            14: 'v14',
        },
        angular: {
            14: 'v14-15',
            15: 'v14-15',
            16: 'v16-17',
            17: 'v16-17',
        },
        react: {
            17: 'v17',
            18: 'v18',
        },
    };
};

/**
 * Map a specific version to a version range directory
 * @param {string} framework - The framework name (e.g., 'laravel', 'nextjs')
 * @param {number} version - The detected version number
 * @param {string} templatesDir - The templates directory path
 * @returns {string} - The version range directory name
 */
export const mapVersionToRange = (framework, version, templatesDir) => {
    if (!version) return null;

    const versionRanges = getVersionRangesConfig(templatesDir);
    return versionRanges[framework]?.[version] || `v${version}`;
};

/**
 * Detect Laravel version from composer.json
 * @param {string} projectPath - The path to the project directory
 * @returns {number|null} - The detected Laravel version or null
 */
export const detectLaravelVersion = (projectPath = '.') => {
    try {
        const composerPath = path.join(projectPath, 'composer.json');
        console.log(`Looking for composer.json at: ${composerPath}`);

        if (!fs.existsSync(composerPath)) {
            console.log(`composer.json not found at: ${composerPath}`);
            return null;
        }

        const composerContent = fs.readFileSync(composerPath, 'utf8');
        console.log(`Found composer.json with size: ${composerContent.length} bytes`);

        const composer = JSON.parse(composerContent);

        if (!composer.require || !composer.require['laravel/framework']) {
            console.log(`laravel/framework not found in composer.json require section`);
            return null;
        }

        const version = composer.require['laravel/framework'];
        console.log(`Detected Laravel version string: ${version}`);

        const match = version.match(/\d+/);
        if (match) {
            const detectedVersion = parseInt(match[0], 10);
            console.log(`Parsed Laravel version: ${detectedVersion}`);
            return detectedVersion;
        } else {
            console.log(`Failed to parse version number from: ${version}`);
            return null;
        }
    } catch (error) {
        console.error(`Error detecting Laravel version:`, error);
        return null;
    }
};

/**
 * Detect Next.js version from package.json
 * @param {string} projectPath - The path to the project directory
 * @returns {number|null} - The detected Next.js version or null
 */
export const detectNextjsVersion = (projectPath = '.') => {
    try {
        const packagePath = path.join(projectPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const version = pkg.dependencies?.['next'] || '';
        return version.match(/\d+/) ? parseInt(version.match(/\d+/)[0], 10) : null;
    } catch {
        return null;
    }
};

/**
 * Detect Angular version from package.json
 * @param {string} projectPath - The path to the project directory
 * @returns {number|null} - The detected Angular version or null
 */
export const detectAngularVersion = (projectPath = '.') => {
    try {
        const packagePath = path.join(projectPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const version = pkg.dependencies?.['@angular/core'] || '';
        return version.match(/\d+/) ? parseInt(version.match(/\d+/)[0], 10) : null;
    } catch {
        return null;
    }
};

/**
 * Detect React version from package.json
 * @param {string} projectPath - The path to the project directory
 * @returns {number|null} - The detected React version or null
 */
export const detectReactVersion = (projectPath = '.') => {
    try {
        const packagePath = path.join(projectPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const version = pkg.dependencies?.['react'] || '';
        return version.match(/\d+/) ? parseInt(version.match(/\d+/)[0], 10) : null;
    } catch {
        return null;
    }
};

/**
 * Detect version for a specific framework
 * @param {string} framework - The framework name
 * @param {string} projectPath - The path to the project directory
 * @returns {number|null} - The detected version or null
 */
export const detectVersion = (framework, projectPath = '.') => {
    console.log(`Attempting to detect version for ${framework} at path: ${projectPath}`);

    const detectors = {
        laravel: () => detectLaravelVersion(projectPath),
        nextjs: () => detectNextjsVersion(projectPath),
        angular: () => detectAngularVersion(projectPath),
        react: () => detectReactVersion(projectPath),
    };

    if (!detectors[framework]) {
        console.log(`No detector found for framework: ${framework}`);
        return null;
    }

    const version = detectors[framework]();
    console.log(`Detected ${framework} version: ${version}`);
    return version;
};

/**
 * Get all version-specific directories for a framework
 * @param {string} templatesDir - The templates directory path
 * @param {string} framework - The framework name
 * @returns {string[]} - Array of version directory names
 */
export const getVersionDirectories = (templatesDir, framework) => {
    const stackDir = path.join(templatesDir, 'stacks', framework);

    if (!fs.existsSync(stackDir)) {
        return [];
    }

    return fs.readdirSync(stackDir)
        .filter(dir => dir.startsWith('v') && dir !== 'base')
        .map(dir => dir);
};

/**
 * Get appropriate version directory based on detected version
 * @param {string} templatesDir - The templates directory path
 * @param {string} framework - The framework name
 * @param {string} projectPath - The path to the project directory
 * @returns {string|null} - The appropriate version directory or null
 */
export const getVersionDirectory = (templatesDir, framework, projectPath = '.') => {
    console.log(`Getting version directory for ${framework} with project path: ${projectPath}`);

    const version = detectVersion(framework, projectPath);
    if (!version) {
        console.log(`No version detected for ${framework}`);
        return null;
    }

    const versionRange = mapVersionToRange(framework, version, templatesDir);
    console.log(`Mapped version ${version} to range: ${versionRange}`);

    const versionDirs = getVersionDirectories(templatesDir, framework);
    console.log(`Available version directories: ${versionDirs.join(', ')}`);

    // Check if we have the exact version range
    if (versionRange && versionDirs.includes(versionRange)) {
        console.log(`Using version range directory: ${versionRange}`);
        return versionRange;
    }

    // Check if we have an exact version match
    const exactVersion = `v${version}`;
    if (versionDirs.includes(exactVersion)) {
        console.log(`Using exact version directory: ${exactVersion}`);
        return exactVersion;
    }

    console.log(`No matching version directory found for ${framework} ${version}`);
    return null;
}; 