import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ConfigService } from '../../cli/services/config-service.js';
import { FileService } from '../../cli/services/file-service.js';
import { ReactService } from '../../cli/services/stack/react-service.js';

// Mock dependencies first
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn().mockReturnValue('# Sample content with {stack} {detectedVersion}'),
            ensureDirSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn()
        },
        readFileSync: vi.fn().mockReturnValue('# Sample content with {stack} {detectedVersion}'),
        ensureDirSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn()
    };
});

// Import dependencies after mocking
import fs from 'fs-extra';

describe('React Service', () => {
    let reactService;
    let configService;
    let fileService;
    const templatesDir = '/templates';

    beforeEach(() => {
        vi.resetAllMocks();

        // Mock console.log para evitar output en tests
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });

        // Crear servicios
        configService = new ConfigService({ debug: true, templatesDir });
        fileService = new FileService({ debug: true, templatesDir });
        reactService = new ReactService({
            debug: true,
            configService,
            fileService,
            templatesDir
        });

        // Mock métodos internos
        configService.debugLog = vi.fn();
        fileService.debugLog = vi.fn();
        fileService.copyRuleGroup = vi.fn();
        fileService.readFile = vi.fn().mockReturnValue('# Content for {stack} {detectedVersion}');
        fileService.writeFile = vi.fn();
        fileService.addFrontMatter = vi.fn((content) => `---\n---\n${content}`);
        fileService.ensureDirectoryExists = vi.fn();
        reactService.debugLog = vi.fn();

        // Mock métodos con implementaciones personalizadas
        fileService.directoryExists = vi.fn().mockImplementation(dir => fs.existsSync(dir));
        fileService.getFilesInDirectory = vi.fn().mockReturnValue(['file1.md', 'file2.md']);

        // Asegurarse de que processTemplateVariables está correctamente mockeado
        fileService.processTemplateVariables = vi.fn().mockImplementation((content, meta) => {
            return content
                .replace(/{stack}/g, meta.stack || '')
                .replace(/{detectedVersion}/g, meta.detectedVersion || '')
                .replace(/{projectPath}/g, meta.projectPath || './');
        });

        // Exponer wrapMdToMdc directamente para evitar problemas
        fileService.wrapMdToMdc = vi.fn();

        // Default mock implementations
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(['test-file.md']);

        // Mock para el config
        configService.loadKitConfig = vi.fn().mockReturnValue({
            react: {
                globs: ['**/*.jsx', '**/*.tsx'],
                architectures: {
                    standard: { name: "Standard Component Structure" },
                    atomic: { name: "Atomic Design" }
                },
                version_ranges: {
                    "18": { range_name: "v18", name: "React 18" }
                }
            }
        });
    });

    describe('copyArchitectureRules', () => {
        test('should copy architecture files when directory exists', () => {
            const architecture = 'atomic';
            const targetRules = 'target/rules';

            reactService.copyArchitectureRules(architecture, targetRules, {
                stack: 'react',
                debug: true
            });

            expect(fileService.directoryExists).toHaveBeenCalled();
            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            reactService.copyArchitectureRules('atomic', 'target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should pass correct metadata to wrapMdToMdc', () => {
            const architecture = 'atomic';
            const targetRules = 'target/rules';
            const options = {
                stack: 'react',
                projectPath: 'project/path',
                detectedVersion: '18',
                versionRange: 'v18',
                debug: true
            };

            reactService.copyArchitectureRules(architecture, targetRules, options);

            expect(fileService.wrapMdToMdc).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    projectPath: 'project/path',
                    stack: 'react',
                    architecture: 'atomic',
                    detectedVersion: '18',
                    versionRange: 'v18',
                    debug: true
                }),
                expect.any(Object)
            );
        });
    });

    describe('copyTestingRules', () => {
        test('should copy testing files when directory exists', () => {
            reactService.copyTestingRules('target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.directoryExists).toHaveBeenCalled();
            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            reactService.copyTestingRules('target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
        });
    });

    describe('copyStateManagementRules', () => {
        test('should copy state management files when directory exists', () => {
            reactService.copyStateManagementRules('redux', 'target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.directoryExists).toHaveBeenCalled();
            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
        });

        test('should not copy anything when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            reactService.copyStateManagementRules('redux', 'target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should not do anything when stateManagement is not provided', () => {
            reactService.copyStateManagementRules(null, 'target/rules', {
                stack: 'react',
                debug: true
            });

            expect(fileService.directoryExists).not.toHaveBeenCalled();
            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
        });

        test('should pass correct metadata to wrapMdToMdc', () => {
            const stateManagement = 'redux';
            const targetRules = 'target/rules';
            const options = {
                stack: 'react',
                projectPath: 'project/path',
                detectedVersion: '18',
                versionRange: 'v18',
                debug: true
            };

            reactService.copyStateManagementRules(stateManagement, targetRules, options);

            expect(fileService.wrapMdToMdc).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    projectPath: 'project/path',
                    stack: 'react',
                    stateManagement: 'redux',
                    detectedVersion: '18',
                    versionRange: 'v18',
                    debug: true
                }),
                expect.any(Object)
            );
        });
    });

    describe('copyBaseRules', () => {
        test('should copy base rules for React', () => {
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);

            const result = reactService.copyBaseRules(targetRules, {
                stack: 'react',
                detectedVersion: '18'
            });

            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        test('should handle missing base directory', () => {
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(false);

            const result = reactService.copyBaseRules(targetRules, {
                stack: 'react'
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
}); 