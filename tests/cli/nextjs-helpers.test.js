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

// Import dependencies after mocking
import fs from 'fs-extra';
import * as fileHelpers from '../../cli/utils/file-helpers.js';
import { copyArchitectureRules } from '../../cli/utils/nextjs-helpers.js';

describe('Next.js Helpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('copyArchitectureRules', () => {
        it('should not process anything when architecture is null', () => {
            copyArchitectureRules('templatesDir', null, 'targetRules');

            expect(fs.existsSync).not.toHaveBeenCalled();
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        it('should copy app architecture files when app is selected', () => {
            const templatesDir = '/templates';
            const architecture = 'app';
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['app-router.md']);

            copyArchitectureRules(templatesDir, architecture, targetRules);

            expect(fs.ensureDirSync).toHaveBeenCalledWith(path.join(targetRules, 'nextjs'));
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledTimes(1);
        });

        it('should copy both architecture types when hybrid is selected', () => {
            const templatesDir = '/templates';
            const architecture = 'hybrid';
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['router.md']);

            copyArchitectureRules(templatesDir, architecture, targetRules);

            expect(fs.ensureDirSync).toHaveBeenCalledTimes(2);
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledTimes(2);
        });

        it('should handle non-existent architecture directories', () => {
            const templatesDir = '/templates';
            const architecture = 'app';
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(false);

            copyArchitectureRules(templatesDir, architecture, targetRules);

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });
    });
}); 