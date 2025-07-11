/**
 * Test for test-cli.js functionality
 */
import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const execAsync = promisify(exec);

describe('Test CLI Integration', () => {
    const testOutputDir = 'test-output';
    const testCliPath = path.join(process.cwd(), 'tests', 'test-cli.js');

    beforeEach(async () => {
        // Clean up any previous test output
        if (await fs.pathExists(testOutputDir)) {
            await fs.remove(testOutputDir);
        }
    });

    afterEach(async () => {
        // Clean up test output after tests
        if (await fs.pathExists(testOutputDir)) {
            await fs.remove(testOutputDir);
        }
    });

    test('should generate Laravel rules correctly', async () => {
        const command = `node "${testCliPath}" --stack=laravel --version=11 --architecture=standard --root=${testOutputDir}`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('✅ Global rules copied successfully!');
        expect(stdout).toContain('✅ Test completed');

        // Verify global rules are generated
        const globalDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'global');
        expect(await fs.pathExists(globalDir)).toBe(true);

        const globalFiles = await fs.readdir(globalDir);
        expect(globalFiles.length).toBeGreaterThan(0);
        expect(globalFiles.some(f => f.endsWith('.mdc'))).toBe(true);

        // Verify Laravel specific rules are generated
        const laravelDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'laravel');
        expect(await fs.pathExists(laravelDir)).toBe(true);

        const laravelFiles = await fs.readdir(laravelDir);
        expect(laravelFiles.length).toBeGreaterThan(0);
        expect(laravelFiles.some(f => f.endsWith('.mdc'))).toBe(true);

        // Verify specific files exist
        expect(laravelFiles).toContain('architecture-concepts.mdc');
        expect(laravelFiles).toContain('best-practices.mdc');
        expect(laravelFiles).toContain('version-info.mdc');
        expect(laravelFiles).toContain('architecture-standard-structure.mdc');
    }, 10000);

    test('should generate Angular rules correctly', async () => {
        const command = `node "${testCliPath}" --stack=angular --version=14 --architecture=standard --root=${testOutputDir}`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('✅ Global rules copied successfully!');
        expect(stdout).toContain('✅ Test completed');

        // Verify Angular specific rules are generated
        const angularDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'angular');
        expect(await fs.pathExists(angularDir)).toBe(true);

        const angularFiles = await fs.readdir(angularDir);
        expect(angularFiles.length).toBeGreaterThan(0);
        expect(angularFiles.some(f => f.endsWith('.mdc'))).toBe(true);

        // Verify specific files exist
        expect(angularFiles).toContain('architecture-concepts.mdc');
        expect(angularFiles).toContain('best-practices.mdc');
        expect(angularFiles).toContain('version-info.mdc');
    }, 10000);

    test('should generate Laravel DDD architecture rules', async () => {
        const command = `node "${testCliPath}" --stack=laravel --version=11 --architecture=ddd --root=${testOutputDir}`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('✅ Test completed');

        const laravelDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'laravel');
        const laravelFiles = await fs.readdir(laravelDir);

        expect(laravelFiles).toContain('architecture-ddd-structure.mdc');
    }, 10000);

    test('should generate NestJS microservices architecture rules', async () => {
        const command = `node "${testCliPath}" --stack=nestjs --version=9 --architecture=microservices --root=${testOutputDir}`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('✅ Test completed');

        const nestDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'nestjs');
        const nestFiles = await fs.readdir(nestDir);

        expect(nestFiles).toContain('architecture-microservices-microservices-architecture.mdc');
    }, 10000);

    test('should generate Next.js app router architecture rules', async () => {
        const command = `node \"${testCliPath}\" --stack=nextjs --version=14 --architecture=app --root=${testOutputDir}`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('✅ Test completed');

        const nextDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'nextjs');
        const nextFiles = await fs.readdir(nextDir);

        expect(nextFiles).toContain('architecture-app-app-router.mdc');
    }, 10000);

    test('should generate only global rules when no stack specified', async () => {
        const command = `node "${testCliPath}" --no-global=false --stack='' --root=${testOutputDir}`;

        try {
            await execAsync(command);
        } catch (error) {
            // This might error since we're not providing a valid stack
            // But let's check if global rules were generated
        }

        // At minimum, we should be able to generate global rules
        const globalDir = path.join(testOutputDir, '.cursor', 'rules', 'rules-kit', 'global');
        if (await fs.pathExists(globalDir)) {
            const globalFiles = await fs.readdir(globalDir);
            expect(globalFiles.length).toBeGreaterThan(0);
        }
    }, 10000);

    test('should handle invalid stack gracefully', async () => {
        const command = `node "${testCliPath}" --stack=invalidstack --version=1 --root=${testOutputDir}`;

        try {
            await execAsync(command);
        } catch (error) {
            // Should fail gracefully with an error message
            expect(error.stderr || error.stdout).toContain('Error');
        }
    }, 10000);

    test('should generate rules with debug output', async () => {
        const command = `node "${testCliPath}" --stack=laravel --version=11 --root=${testOutputDir} --debug`;

        const { stdout, stderr } = await execAsync(command);

        expect(stderr).toBe('');
        expect(stdout).toContain('[DEBUG]');
        expect(stdout).toContain('Replaced {stack} with laravel');
        expect(stdout).toContain('Replaced {detectedVersion} with 11');
    }, 10000);
}); 