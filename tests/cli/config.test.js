import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../cli/services/config-service.js';
import { StackService } from '../../cli/services/stack-service.js';

// Mock fs-extra
vi.mock('fs-extra', async () => {
    const mockFunctions = {
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        readdirSync: vi.fn(),
        statSync: vi.fn(),
        pathExists: vi.fn()
    };

    return {
        ...mockFunctions,
        default: mockFunctions,
        __esModule: true
    };
});

// Import fs after mocking
import fs from 'fs-extra';

describe('Config Module', () => {
    let configService;
    let stackService;
    const templatesDir = '/templates';

    beforeEach(() => {
        vi.resetAllMocks();
        configService = new ConfigService({ debug: true, templatesDir });
        stackService = new StackService({ debug: true, configService, templatesDir });

        // Mock métodos internos
        configService.debugLog = vi.fn();
    });

    describe('loadKitConfig', () => {
        it('should load configuration from kit-config.json', () => {
            const mockConfig = {
                version_ranges: {
                    "8": "v8-9",
                    "9": "v8-9"
                }
            };

            // Setup mocks
            const mockJSON = JSON.stringify(mockConfig);
            fs.existsSync.mockReturnValue(true);
            fs.statSync.mockReturnValue({ size: mockJSON.length });
            fs.readFileSync.mockReturnValue(mockJSON);

            const result = configService.loadKitConfig(templatesDir);

            // Just verify that it returns what's in the file
            expect(fs.existsSync).toHaveBeenCalledWith(path.join(templatesDir, 'kit-config.json'));
            expect(fs.readFileSync).toHaveBeenCalledWith(path.join(templatesDir, 'kit-config.json'), 'utf8');
            expect(result).toEqual(mockConfig);
        });

        it('should return default config if config file does not exist', () => {
            // Setup mock
            fs.existsSync.mockReturnValue(false);

            const result = configService.loadKitConfig(templatesDir);

            expect(result).toBeTruthy();
            expect(result.laravel).toBeDefined();
        });

        it('should handle JSON parse errors gracefully', () => {
            // Setup mocks
            fs.existsSync.mockReturnValue(true);
            fs.statSync.mockReturnValue({ size: 100 });
            fs.readFileSync.mockReturnValue('invalid json');

            // Spy on debugLog to verify error handling
            const debugSpy = vi.spyOn(configService, 'debugLog');

            const result = configService.loadKitConfig(templatesDir);

            expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing kit-config.json'));
            expect(result).toBeTruthy();
            expect(result.laravel).toBeDefined();
        });
    });

    describe('getAvailableArchitectures', () => {
        it('should get architectures from the new location if available', () => {
            const stack = 'laravel';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['standard', 'ddd', 'hexagonal']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            // Usar stackService que internamente usa configService
            const result = stackService.getAvailableArchitectures(stack);

            expect(result.length).toBe(3);
            expect(result[0].value).toBe('standard');
            expect(fs.existsSync).toHaveBeenCalledWith(path.join(templatesDir, 'stacks', stack, 'architectures'));
        });

        it('should fallback to the old location if new location does not exist', () => {
            const stack = 'laravel';

            // Reseteamos el mock para tener control completo
            fs.existsSync.mockReset();

            // Primero se chequea el archivo de configuración
            fs.existsSync.mockImplementationOnce(() => true); // kit-config.json

            // Después se chequea si existe el directorio nuevo de arquitecturas
            fs.existsSync.mockImplementationOnce(() => false); // stacks/laravel/architectures

            // Finalmente se chequea el directorio antiguo de arquitecturas
            fs.existsSync.mockImplementationOnce(() => true); // architectures/laravel

            // Para cualquier otra llamada
            fs.existsSync.mockImplementation(() => true);

            fs.readdirSync.mockReturnValue(['standard']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            const result = stackService.getAvailableArchitectures(stack);

            expect(result.length).toBe(1);
            expect(result[0].value).toBe('standard');
        });

        it('should get architectures from config if filesystem check fails', () => {
            const stack = 'laravel';
            const mockConfig = {
                laravel: {
                    architectures: {
                        standard: { name: "Standard Laravel" },
                        ddd: { name: "Domain-Driven Design" }
                    }
                }
            };

            fs.existsSync.mockReturnValue(false);
            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);

            const result = stackService.getAvailableArchitectures(stack);

            expect(result.length).toBe(2);
            expect(result[0].value).toBe('standard');
            expect(result[0].name).toBe('Standard Laravel');
        });
    });

    describe('getDefaultConfig', () => {
        it('should return a default configuration object', () => {
            const defaultConfig = configService.getDefaultConfig();

            expect(defaultConfig).toBeTruthy();
            expect(defaultConfig.laravel).toBeDefined();
            expect(defaultConfig.nextjs).toBeDefined();
            expect(defaultConfig.react).toBeDefined();
            expect(defaultConfig.global).toBeDefined();
        });
    });

    describe('getGlobalRules', () => {
        it('should return global rules from config', () => {
            const mockConfig = {
                global: {
                    always: ['README.md', 'CONTRIBUTING.md']
                }
            };

            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);

            const globalRules = configService.getGlobalRules();

            expect(globalRules).toEqual(['README.md', 'CONTRIBUTING.md']);
        });
    });

    describe('processTemplateVariables', () => {
        it('should replace template variables in content', () => {
            const content = 'Project {stack} version {detectedVersion} with {versionRange}';
            const meta = {
                stack: 'laravel',
                detectedVersion: '10',
                formattedVersionName: 'v10-11'
            };

            const result = configService.processTemplateVariables(content, meta);

            expect(result).toBe('Project laravel version 10 with v10-11');
        });

        it('should handle missing variables', () => {
            const content = 'Project {stack} with {missingVar}';
            const meta = { stack: 'laravel' };

            const result = configService.processTemplateVariables(content, meta);

            expect(result).toBe('Project laravel with {missingVar}');
        });
    });
}); 