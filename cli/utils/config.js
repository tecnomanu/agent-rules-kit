/**
 * Configuration utilities for Agent Rules Kit
 */
import fs from 'fs-extra';
import path from 'path';

/**
 * Stack options and constants
 */
// List of supported stacks
export const STACKS = [
    'laravel',
    'nextjs',
    'react',
    'angular',
    'nestjs',
    'vue',
    'nuxt',
    'astro',
    'generic'
];

// Laravel architecture options
export const LARAVEL_ARCHITECTURES = [
    { name: 'Standard Laravel (MVC with Repositories)', value: 'standard' },
    { name: 'Domain-Driven Design (DDD)', value: 'ddd' },
    { name: 'Hexagonal Architecture (Ports and Adapters)', value: 'hexagonal' },
];

// Next.js router mode options
export const NEXTJS_ROUTER_MODES = [
    { name: 'App Router (Next.js 13+)', value: 'app' },
    { name: 'Pages Router', value: 'pages' },
    { name: 'Hybrid (Both routers)', value: 'hybrid' },
];

/**
 * React architecture options
 */
export const REACT_ARCHITECTURES = [
    { name: 'Standard React (Component-based)', value: 'standard' },
    { name: 'Atomic Design', value: 'atomic' },
    { name: 'Feature-Sliced Design', value: 'feature-sliced' }
];

/**
 * React state management options
 */
export const REACT_STATE_MANAGEMENT = [
    { name: 'React Context API', value: 'context' },
    { name: 'Redux', value: 'redux' },
    { name: 'MobX', value: 'mobx' },
    { name: 'Recoil', value: 'recoil' },
    { name: 'Zustand', value: 'zustand' },
    { name: 'None', value: 'none' }
];

/**
 * Loads the kit configuration from kit-config.json
 * @param {string} templatesDir - Path to templates directory
 * @returns {Object} - Kit configuration object
 */
export const loadKitConfig = (templatesDir) => {
    try {
        const configPath = path.join(templatesDir, 'kit-config.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading kit configuration:', error);
    }
    return {};
};

/**
 * Gets available architectures for a specific stack
 * @param {string} stack - Stack name
 * @param {string} templatesDir - Templates directory
 * @returns {Array} - List of available architectures
 */
export const getAvailableArchitectures = (stack, templatesDir) => {
    if (stack === 'laravel') {
        // Check if architectures exist in the new location
        const newArchDir = path.join(templatesDir, 'stacks', stack, 'architectures');
        if (fs.existsSync(newArchDir)) {
            return fs.readdirSync(newArchDir)
                .filter(dir => fs.statSync(path.join(newArchDir, dir)).isDirectory())
                .map(dir => LARAVEL_ARCHITECTURES.find(a => a.value === dir) || { name: dir, value: dir });
        }

        // Fallback to old location
        const oldArchDir = path.join(templatesDir, 'architectures', stack);
        if (fs.existsSync(oldArchDir)) {
            return fs.readdirSync(oldArchDir)
                .filter(dir => fs.statSync(path.join(oldArchDir, dir)).isDirectory())
                .map(dir => LARAVEL_ARCHITECTURES.find(a => a.value === dir) || { name: dir, value: dir });
        }
    }

    return [];
}; 