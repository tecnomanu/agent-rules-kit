import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../cli/services/config-service.js';
import { FileService } from '../../cli/services/file-service.js';
import { NextjsService } from '../../cli/services/stack/nextjs-service.js';

// Mock dependencies first
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn().mockReturnValue('# Sample content with {stack} {detectedVersion}'),
            ensureDirSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn(),
            statSync: vi.fn()
        },
        readFileSync: vi.fn().mockReturnValue('# Sample content with {stack} {detectedVersion}'),
        ensureDirSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
        statSync: vi.fn()
    };
});

// Import dependencies after mocking
import fs from 'fs-extra';

describe('Next.js Service', () => {
    let nextjsService;
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
        nextjsService = new NextjsService({
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
        nextjsService.debugLog = vi.fn();

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

        // Mock para métodos específicos de NextjsService
        nextjsService.copyAppArchitecture = vi.fn();
        nextjsService.copyPagesArchitecture = vi.fn();

        // Mock para el config
        configService.loadKitConfig = vi.fn().mockReturnValue({
            nextjs: {
                globs: ['**/*.js'],
                architectures: {
                    app: { name: "App Router" },
                    pages: { name: "Pages Router" }
                },
                version_ranges: {
                    "13": { range_name: "v13", name: "Next.js 13" }
                }
            }
        });
    });

    describe('copyArchitectureRules', () => {
        it('should not process anything when architecture is null', () => {
            nextjsService.copyArchitectureRules(null, '/rules', {
                stack: 'nextjs'
            });

            expect(nextjsService.copyAppArchitecture).not.toHaveBeenCalled();
            expect(nextjsService.copyPagesArchitecture).not.toHaveBeenCalled();
        });

        it('should copy app architecture files when app is selected', () => {
            const architecture = 'app';
            const targetRules = '/rules';

            nextjsService.copyArchitectureRules(architecture, targetRules, {
                stack: 'nextjs',
                detectedVersion: '13'
            });

            expect(nextjsService.copyAppArchitecture).toHaveBeenCalled();
            expect(nextjsService.copyPagesArchitecture).not.toHaveBeenCalled();
        });

        it('should copy both architecture types when hybrid is selected', () => {
            const architecture = 'hybrid';
            const targetRules = '/rules';

            nextjsService.copyArchitectureRules(architecture, targetRules, {
                stack: 'nextjs',
                detectedVersion: '13'
            });

            expect(nextjsService.copyAppArchitecture).toHaveBeenCalled();
            expect(nextjsService.copyPagesArchitecture).toHaveBeenCalled();
        });

        it('should handle non-existent architecture directories', () => {
            const architecture = 'app';
            const targetRules = '/rules';

            // Mockear métodos directamente
            nextjsService.copyAppArchitecture = vi.fn();

            nextjsService.copyArchitectureRules(architecture, targetRules, {
                stack: 'nextjs'
            });

            // Igual deberían llamarse los métodos internos
            expect(nextjsService.copyAppArchitecture).toHaveBeenCalled();
        });
    });

    describe('copyBaseRules', () => {
        it('should copy base rules for Next.js', () => {
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);

            // No podemos mockear copyRuleGroup porque nunca se llama directamente
            // Pero podemos validar que fileService.wrapMdToMdc se llama

            const result = nextjsService.copyBaseRules(targetRules, {
                stack: 'nextjs',
                detectedVersion: '13'
            });

            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should handle missing base directory', () => {
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(false);

            const result = nextjsService.copyBaseRules(targetRules, {
                stack: 'nextjs'
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('copyVersionOverlay', () => {
        it('should copy version overlay rules', () => {
            const versionRange = 'v13';
            const targetRules = '/rules';

            fs.existsSync.mockReturnValue(true);

            nextjsService.copyVersionOverlay(versionRange, targetRules, {
                stack: 'nextjs',
                detectedVersion: '13'
            });

            expect(fileService.wrapMdToMdc).toHaveBeenCalled();
        });

        it('should handle invalid version range', () => {
            const versionRange = null;
            const targetRules = '/rules';

            nextjsService.copyVersionOverlay(versionRange, targetRules, {
                stack: 'nextjs'
            });

            expect(fileService.wrapMdToMdc).not.toHaveBeenCalled();
        });
    });
}); 