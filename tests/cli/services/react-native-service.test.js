import path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ReactNativeService } from '../../../cli/services/stack/react-native-service.js'; // Adjust path as needed

// Mocks
const mockFileService = {
    directoryExists: vi.fn(),
    getFilesInDirectory: vi.fn(),
    ensureDirectoryExists: vi.fn(),
    wrapMdToMdc: vi.fn(),
};

const mockConfigService = {
    loadKitConfig: vi.fn().mockReturnValue({
        // Mock a minimal kit config structure
        'react-native': {
            globs: ['<root>/**/*.js'],
        },
        global: {
            always: [],
        }
    }),
};

const mockOptions = {
    fileService: mockFileService,
    configService: mockConfigService,
    templatesDir: path.join(__dirname, '..', '..', '..', 'templates'), // Adjust path to your templates directory
    debug: false,
};

describe('ReactNativeService', () => {
    let reactNativeService;

    beforeEach(() => {
        vi.clearAllMocks(); // Reset mocks before each test
        reactNativeService = new ReactNativeService(mockOptions);
    });

    test('constructor initializes correctly', () => {
        expect(reactNativeService.stackName).toBe('react-native');
        expect(reactNativeService.fileService).toBe(mockFileService);
        expect(reactNativeService.configService).toBe(mockConfigService);
    });

    describe('copyBaseRules', () => {
        const targetRules = '.cursor/rules/rules-kit';
        const versionMeta = { detectedVersion: '0.71.0', versionRange: 'v0.7x' };
        const serviceOptions = { projectPath: '.', debug: false, templatesDir: mockOptions.templatesDir };
        const baseDir = path.join(mockOptions.templatesDir, 'stacks', 'react-native', 'base');

        test('should return true and copy files if base directory and files exist', () => {
            mockFileService.directoryExists.mockReturnValue(true);
            mockFileService.getFilesInDirectory.mockReturnValue(['test-rule1.md', 'test-rule2.md']);

            const result = reactNativeService.copyBaseRules(targetRules, versionMeta, serviceOptions);

            expect(result).toBe(true);
            expect(mockFileService.directoryExists).toHaveBeenCalledWith(baseDir);
            expect(mockFileService.ensureDirectoryExists).toHaveBeenCalledWith(path.join(targetRules, 'react-native'));
            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledTimes(2);
            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledWith(
                path.join(baseDir, 'test-rule1.md'),
                path.join(targetRules, 'react-native', 'test-rule1.mdc'),
                expect.objectContaining({ stack: 'react-native' }),
                expect.any(Object) // kitConfig
            );
            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledWith(
                path.join(baseDir, 'test-rule2.md'),
                path.join(targetRules, 'react-native', 'test-rule2.mdc'),
                expect.objectContaining({ stack: 'react-native' }),
                expect.any(Object) // kitConfig
            );
        });

        test('should return false if base directory does not exist', () => {
            mockFileService.directoryExists.mockReturnValue(false); // Simulate base directory not found

            const result = reactNativeService.copyBaseRules(targetRules, versionMeta, serviceOptions);

            expect(result).toBe(false);
            expect(mockFileService.directoryExists).toHaveBeenCalledWith(baseDir);
            expect(mockFileService.ensureDirectoryExists).not.toHaveBeenCalled();
            expect(mockFileService.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should handle empty base files list', () => {
            mockFileService.directoryExists.mockReturnValue(true);
            mockFileService.getFilesInDirectory.mockReturnValue([]); // Simulate empty directory

            const result = reactNativeService.copyBaseRules(targetRules, versionMeta, serviceOptions);

            expect(result).toBe(true); // Still true as operation didn't fail, just no files to copy
            expect(mockFileService.ensureDirectoryExists).toHaveBeenCalledWith(path.join(targetRules, 'react-native'));
            expect(mockFileService.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should only process .md files', () => {
            mockFileService.directoryExists.mockReturnValue(true);
            mockFileService.getFilesInDirectory.mockReturnValue(['test-rule1.md', 'image.png', 'test-rule2.md']);

            reactNativeService.copyBaseRules(targetRules, versionMeta, serviceOptions);

            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledTimes(2);
            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledWith(
                expect.stringContaining('test-rule1.md'),
                expect.stringContaining('test-rule1.mdc'),
                expect.anything(),
                expect.anything()
            );
            expect(mockFileService.wrapMdToMdc).toHaveBeenCalledWith(
                expect.stringContaining('test-rule2.md'),
                expect.stringContaining('test-rule2.mdc'),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('copyArchitectureRules', () => {
        test('should return false and log debug message (not implemented)', () => {
            const result = reactNativeService.copyArchitectureRules('target/path', 'standard', {});
            expect(result).toBe(false);
            // Check if debugLog was called (if possible, or just verify behavior)
        });
    });

    describe('copyVersionOverlay', () => {
        test('should return false and log debug message (not implemented)', () => {
            const result = reactNativeService.copyVersionOverlay('target/path', { detectedVersion: '0.70' }, {});
            expect(result).toBe(false);
            // Check if debugLog was called
        });
    });
});
