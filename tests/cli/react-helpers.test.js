import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies first
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn(),
            ensureDirSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn()
        },
        readFileSync: vi.fn(),
        ensureDirSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn()
    };
});

vi.mock('../../cli/utils/file-helpers.js', () => ({
    wrapMdToMdc: vi.fn()
}));

// Import dependencies after mocking
import fs from 'fs-extra';
import * as fileHelpers from '../../cli/utils/file-helpers.js';
import { copyArchitectureRules, copyStateManagementRules, copyTestingRules } from '../../cli/utils/react-helpers.js';

describe('React Helpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Default mock implementations
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(['test-file.md']);
    });

    describe('copyArchitectureRules', () => {
        test('should copy architecture files when directory exists', () => {
            const templatesDir = 'templates';
            const architecture = 'atomic';
            const targetRules = 'target/rules';

            copyArchitectureRules(templatesDir, architecture, targetRules, { debug: true });

            expect(fs.existsSync).toHaveBeenCalledWith('templates/stacks/react/architectures/atomic');
            expect(fs.readdirSync).toHaveBeenCalledWith('templates/stacks/react/architectures/atomic');
            expect(fs.ensureDirSync).toHaveBeenCalledWith('target/rules/react');
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            copyArchitectureRules('templates', 'atomic', 'target/rules', { debug: true });

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.ensureDirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should pass correct metadata to wrapMdToMdc', () => {
            const templatesDir = 'templates';
            const architecture = 'atomic';
            const targetRules = 'target/rules';
            const options = {
                projectPath: 'project/path',
                detectedVersion: '18',
                versionRange: 'v18',
                debug: true
            };

            copyArchitectureRules(templatesDir, architecture, targetRules, options);

            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledWith(
                'templates/stacks/react/architectures/atomic/test-file.md',
                'target/rules/react/architecture-atomic-test-file.mdc',
                expect.objectContaining({
                    projectPath: 'project/path',
                    stack: 'react',
                    architecture: 'atomic',
                    detectedVersion: '18',
                    versionRange: 'v18',
                    debug: true
                })
            );
        });
    });

    describe('copyTestingRules', () => {
        test('should copy testing files when directory exists', () => {
            copyTestingRules('templates', 'target/rules', { debug: true });

            expect(fs.existsSync).toHaveBeenCalledWith('templates/stacks/react/testing');
            expect(fs.readdirSync).toHaveBeenCalledWith('templates/stacks/react/testing');
            expect(fs.ensureDirSync).toHaveBeenCalledWith('target/rules/react');
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            copyTestingRules('templates', 'target/rules', { debug: true });

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.ensureDirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });
    });

    describe('copyStateManagementRules', () => {
        test('should copy state management files when directory exists', () => {
            copyStateManagementRules('templates', 'redux', 'target/rules', { debug: true });

            expect(fs.existsSync).toHaveBeenCalledWith('templates/stacks/react/state-management/redux');
            expect(fs.readdirSync).toHaveBeenCalledWith('templates/stacks/react/state-management/redux');
            expect(fs.ensureDirSync).toHaveBeenCalledWith('target/rules/react');
            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            copyStateManagementRules('templates', 'redux', 'target/rules', { debug: true });

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.ensureDirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should not do anything when stateManagement is not provided', () => {
            copyStateManagementRules('templates', null, 'target/rules', { debug: true });

            expect(fs.existsSync).not.toHaveBeenCalled();
            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.ensureDirSync).not.toHaveBeenCalled();
            expect(fileHelpers.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should pass correct metadata to wrapMdToMdc', () => {
            const templatesDir = 'templates';
            const stateManagement = 'redux';
            const targetRules = 'target/rules';
            const options = {
                projectPath: 'project/path',
                detectedVersion: '18',
                versionRange: 'v18',
                debug: true
            };

            copyStateManagementRules(templatesDir, stateManagement, targetRules, options);

            expect(fileHelpers.wrapMdToMdc).toHaveBeenCalledWith(
                'templates/stacks/react/state-management/redux/test-file.md',
                'target/rules/react/state-redux-test-file.mdc',
                expect.objectContaining({
                    projectPath: 'project/path',
                    stack: 'react',
                    stateManagement: 'redux',
                    detectedVersion: '18',
                    versionRange: 'v18',
                    debug: true
                })
            );
        });
    });
}); 