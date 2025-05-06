import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies first
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn(),
            ensureDirSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn(),
            statSync: vi.fn()
        },
        readFileSync: vi.fn(),
        ensureDirSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
        statSync: vi.fn()
    };
});

vi.mock('../../cli/utils/file-helpers.js', () => ({
    wrapMdToMdc: vi.fn()
}));

vi.mock('../../cli/version-detector.js', () => ({
    detectVersion: vi.fn(),
    getVersionDirectory: vi.fn(),
    mapVersionToRange: vi.fn()
}));

// Import dependencies after mocking
import fs from 'fs-extra';
import * as fileHelpers from '../../cli/utils/file-helpers.js';
import { copyArchitectureRules, copyStack, copyVersionOverlay } from '../../cli/utils/stack-helpers.js';
import * as versionDetector from '../../cli/version-detector.js';

describe('Stack Helpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('copyVersionOverlay', () => {
        it('should not process anything when versionDir is null', () => {
            copyVersionOverlay('templatesDir', 'laravel', null, 'targetRules');

            expect(fs.existsSync).not.toHaveBeenCalled();
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        it('should copy version overlay files correctly', () => {
            const templatesDir = '/templates';
            const stack = 'laravel';
            const versionDir = 'v10-11';
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['file1.md', 'file2.md']);

            copyVersionOverlay(templatesDir, stack, versionDir, targetRules);

            expect(fs.ensureDirSync).toHaveBeenCalledWith(path.join(targetRules, stack));
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledTimes(2);
        });
    });

    describe('copyArchitectureRules', () => {
        it('should not process anything when architecture is null', () => {
            copyArchitectureRules('templatesDir', 'laravel', null, 'targetRules');

            expect(fs.existsSync).not.toHaveBeenCalled();
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        it('should not process anything for non-Laravel stacks', () => {
            copyArchitectureRules('templatesDir', 'nextjs', 'standard', 'targetRules');

            expect(fs.existsSync).not.toHaveBeenCalled();
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        it('should prefer new architecture directory structure if available', () => {
            const templatesDir = '/templates';
            const stack = 'laravel';
            const architecture = 'ddd';
            const targetRules = '/rules';

            // New structure exists
            fs.existsSync.mockImplementation((path) => {
                return path.includes('/stacks/laravel/architectures/ddd');
            });
            fs.readdirSync.mockReturnValue(['domain.md', 'application.md']);

            copyArchitectureRules(templatesDir, stack, architecture, targetRules);

            expect(fs.ensureDirSync).toHaveBeenCalledWith(path.join(targetRules, stack));
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledTimes(2);
        });
    });

    describe('copyStack', () => {
        it('should handle missing base directory', async () => {
            const templatesDir = '/templates';
            const stack = 'laravel';
            const targetRules = '/rules';
            const projectPath = '.';

            fs.existsSync.mockReturnValue(false);
            versionDetector.detectVersion.mockReturnValue(null);
            versionDetector.getVersionDirectory.mockReturnValue(null);

            await copyStack(templatesDir, stack, targetRules, projectPath);

            expect(fs.ensureDirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });

        it('should process base files with version info when available', async () => {
            const templatesDir = '/templates';
            const stack = 'laravel';
            const targetRules = '/rules';
            const projectPath = '.';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['version-info.md', 'other.md']);
            versionDetector.detectVersion.mockReturnValue(10);
            versionDetector.mapVersionToRange.mockReturnValue('v10-11');
            versionDetector.getVersionDirectory.mockReturnValue('v10-11');

            await copyStack(templatesDir, stack, targetRules, projectPath);

            expect(fs.ensureDirSync).toHaveBeenCalledWith(path.join(targetRules, stack));
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    detectedVersion: 10,
                    versionRange: 'v10-11',
                    stack: 'laravel'
                })
            );
        });

        it('should call architecture and router specific functions when options provided', async () => {
            const templatesDir = '/templates';
            const stack = 'nextjs';
            const targetRules = '/rules';
            const projectPath = '.';
            const options = {
                architecture: 'standard',
            };

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['file.md']);
            versionDetector.detectVersion.mockReturnValue(13);
            versionDetector.mapVersionToRange.mockReturnValue('v13');
            versionDetector.getVersionDirectory.mockReturnValue('v13');

            await copyStack(templatesDir, stack, targetRules, projectPath, options);

            // Verify stack folder was created
            expect(fs.ensureDirSync).toHaveBeenCalledWith(expect.stringContaining(stack));
        });
    });
}); 