import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../cli/services/config-service.js';
import { FileService } from '../../cli/services/file-service.js';
import { StackService } from '../../cli/services/stack-service.js';

// Mock dependencies first
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn(),
            ensureDirSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn(),
            statSync: vi.fn(),
            copySync: vi.fn()
        },
        readFileSync: vi.fn(),
        ensureDirSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
        statSync: vi.fn(),
        copySync: vi.fn()
    };
});

// Import fs after mocking
import fs from 'fs-extra';

describe('Stack Service', () => {
    let stackService;
    let configService;
    let fileService;
    const templatesDir = '/templates';

    beforeEach(() => {
        vi.resetAllMocks();

        // Crear servicios
        configService = new ConfigService({ debug: true, templatesDir });
        fileService = new FileService({ debug: true, templatesDir });
        stackService = new StackService({
            debug: true,
            configService,
            templatesDir
        });

        // Mock métodos internos
        configService.debugLog = vi.fn();
        fileService.debugLog = vi.fn();
        stackService.debugLog = vi.fn();

        // Mock métodos críticos
        fileService.copyRuleGroup = vi.fn();
        fileService.directoryExists = vi.fn().mockImplementation(dir => fs.existsSync(dir));
        stackService.ensureDirectoryExists = vi.fn();
    });

    describe('getAvailableStacks', () => {
        it('should combine stacks from config and directories', () => {
            const mockConfig = {
                laravel: {},
                nextjs: {},
                global: {}
            };

            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['laravel', 'react', 'vue']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            const stacks = stackService.getAvailableStacks();

            expect(stacks).toContain('laravel');
            expect(stacks).toContain('nextjs');
            expect(stacks).toContain('react');
            expect(stacks).toContain('vue');
            expect(stacks).not.toContain('global');
        });
    });

    describe('mapVersionToRange', () => {
        it('should map specific version to version range', () => {
            const mockConfig = {
                laravel: {
                    version_ranges: {
                        "8": { range_name: "v8-9", name: "Laravel 8-9" },
                        "9": { range_name: "v8-9", name: "Laravel 8-9" },
                        "10": { range_name: "v10-11", name: "Laravel 10-11" },
                        "11": { range_name: "v10-11", name: "Laravel 10-11" }
                    }
                }
            };

            // Es importante asignar el mock antes de llamar al método
            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);
            stackService.configService = configService;

            const result = stackService.mapVersionToRange('laravel', '10');

            expect(result).toBe('v10-11');
        });

        it('should return null for unknown versions', () => {
            const mockConfig = {
                laravel: {
                    version_ranges: {
                        "10": { range_name: "v10-11", name: "Laravel 10-11" }
                    }
                }
            };

            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);
            stackService.configService = configService;

            const result = stackService.mapVersionToRange('laravel', '7');

            expect(result).toBeNull();
        });
    });

    describe('detectStackVersion', () => {
        it('should detect Laravel version', async () => {
            // Mock the service initialization and Laravel service
            const mockLaravelService = {
                detectLaravelVersion: vi.fn().mockReturnValue('10')
            };

            stackService.stackServices = {
                laravel: mockLaravelService
            };

            stackService.getStackService = vi.fn().mockReturnValue(mockLaravelService);

            const result = stackService.detectStackVersion('laravel', './project');

            expect(result).toBe('10');
            expect(mockLaravelService.detectLaravelVersion).toHaveBeenCalled();
            // Check that it was called with a resolved path
            const calledWith = mockLaravelService.detectLaravelVersion.mock.calls[0][0];
            expect(calledWith).toContain('project');
        });

        it('should detect Next.js version', async () => {
            // Mock the service initialization and Next.js service
            const mockNextjsService = {
                detectNextjsVersion: vi.fn().mockReturnValue('13')
            };

            stackService.stackServices = {
                nextjs: mockNextjsService
            };

            stackService.getStackService = vi.fn().mockReturnValue(mockNextjsService);

            const result = stackService.detectStackVersion('nextjs', './project');

            expect(result).toBe('13');
            expect(mockNextjsService.detectNextjsVersion).toHaveBeenCalled();
            // Check that it was called with a resolved path
            const calledWith = mockNextjsService.detectNextjsVersion.mock.calls[0][0];
            expect(calledWith).toContain('project');
        });

        it('should return null for unknown stacks', () => {
            stackService.getStackService = vi.fn().mockReturnValue(null);
            stackService.detectStackVersionGeneric = vi.fn().mockReturnValue(null);

            const result = stackService.detectStackVersion('unknown', './project');

            expect(result).toBeNull();
        });
    });

    describe('formatRulesPath', () => {
        it('should format rules path correctly', () => {
            const result = stackService.formatRulesPath('./project');

            expect(result).toContain('.cursor/rules');
        });

        it('should handle absolute paths', () => {
            const result = stackService.formatRulesPath('/absolute/path');

            expect(result).toContain('.cursor/rules');
        });
    });
}); 