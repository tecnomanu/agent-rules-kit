import * as fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../cli/services/config-service.js';

// Mock fs-extra
vi.mock('fs-extra', () => {
    const mockFunctions = {
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        ensureDirSync: vi.fn(),
        statSync: vi.fn(),
        pathExists: vi.fn(),
        ensureDir: vi.fn()
    };

    return {
        ...mockFunctions,
        default: mockFunctions,
        __esModule: true
    };
});

// Mock path.join to return predictable paths
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return {
        ...actual,
        join: vi.fn((...args) => args.join('/'))
    };
});

describe('ConfigService', () => {
    let configService;
    const templatesDir = '/test/templates';

    beforeEach(() => {
        vi.clearAllMocks();
        configService = new ConfigService({ debug: true, templatesDir });
        configService.debugLog = vi.fn();
    });

    describe('loadKitConfig', () => {
        it('should load config from file when it exists', () => {
            const mockConfig = { test: 'config' };
            const mockJSON = JSON.stringify(mockConfig);
            fs.existsSync.mockReturnValue(true);
            fs.statSync.mockReturnValue({ size: mockJSON.length });
            fs.readFileSync.mockReturnValue(mockJSON);

            const result = configService.loadKitConfig(templatesDir);

            expect(fs.existsSync).toHaveBeenCalledWith(`${templatesDir}/kit-config.json`);
            expect(fs.readFileSync).toHaveBeenCalledWith(`${templatesDir}/kit-config.json`, 'utf8');
            expect(result).toEqual(mockConfig);
        });

        it('should return default config when file does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const defaultConfig = configService.getDefaultConfig();

            const result = configService.loadKitConfig(templatesDir);

            expect(fs.existsSync).toHaveBeenCalledWith(`${templatesDir}/kit-config.json`);
            expect(result).toEqual(defaultConfig);
        });

        it('should handle JSON parse errors', () => {
            fs.existsSync.mockReturnValue(true);
            fs.statSync.mockReturnValue({ size: 100 });
            fs.readFileSync.mockReturnValue('{invalid:json}');

            const debugSpy = vi.spyOn(configService, 'debugLog');

            const result = configService.loadKitConfig(templatesDir);

            expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing kit-config.json'));
            expect(result).toEqual(configService.getDefaultConfig());
        });

        it('should handle file read errors', () => {
            fs.existsSync.mockReturnValue(true);
            fs.statSync.mockImplementation(() => { throw new Error('Test error'); });

            const debugSpy = vi.spyOn(configService, 'debugLog');

            const result = configService.loadKitConfig(templatesDir);

            expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Error loading kit config'));
            expect(result).toEqual(configService.getDefaultConfig());
        });
    });

    describe('getDefaultConfig', () => {
        it('should return a valid default configuration', () => {
            const defaultConfig = configService.getDefaultConfig();

            expect(defaultConfig).toHaveProperty('global');
            expect(defaultConfig).toHaveProperty('laravel');
            expect(defaultConfig).toHaveProperty('nextjs');
            expect(defaultConfig).toHaveProperty('react');

            expect(configService.debugLog).toHaveBeenCalled();
        });
    });

    describe('saveKitConfig', () => {
        it('should save config to file', () => {
            const config = { test: 'config' };

            const result = configService.saveKitConfig(config, templatesDir);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                `${templatesDir}/kit-config.json`,
                JSON.stringify(config, null, 2),
                'utf8'
            );
            expect(result).toBe(true);
        });

        it('should handle errors when saving fails', () => {
            const errorSpy = vi.spyOn(console, 'error');
            const config = { test: 'config' };
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('Test error');
            });

            const result = configService.saveKitConfig(config, templatesDir);

            expect(errorSpy).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('getGlobalRules', () => {
        it('should return global rules from config', () => {
            const mockConfig = {
                global: {
                    always: ['rule1.md', 'rule2.md']
                }
            };
            // Asegurar que loadKitConfig devuelva nuestro mock en lugar del default
            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);

            const result = configService.getGlobalRules();

            expect(result).toEqual(['rule1.md', 'rule2.md']);
        });

        it('should return empty array when global rules are not defined', () => {
            const mockConfig = { global: {} };
            // Asegurar que loadKitConfig devuelva nuestro mock en lugar del default
            configService.loadKitConfig = vi.fn().mockReturnValue(mockConfig);

            const result = configService.getGlobalRules();

            expect(result).toEqual([]);
        });
    });

    describe('processTemplateVariables', () => {
        it('should replace all template variables', () => {
            const content = 'Stack: {stack}, Version: {detectedVersion}, Range: {versionRange}';
            const meta = {
                stack: 'laravel',
                detectedVersion: '10',
                versionRange: 'v10-11',
                formattedVersionName: 'Laravel 10-11'
            };

            const result = configService.processTemplateVariables(content, meta);

            expect(result).toBe('Stack: laravel, Version: 10, Range: Laravel 10-11');
        });

        it('should handle empty content', () => {
            const result = configService.processTemplateVariables('', { stack: 'laravel' });
            expect(result).toBe('');
        });

        it('should handle null content', () => {
            const result = configService.processTemplateVariables(null, { stack: 'laravel' });
            expect(result).toBe(null);
        });

        it('should handle missing variables', () => {
            const content = 'Stack: {stack}, Architecture: {architecture}';
            const meta = { stack: 'laravel' };

            const result = configService.processTemplateVariables(content, meta);

            expect(result).toBe('Stack: laravel, Architecture: {architecture}');
        });

        it('should handle formattedVersionName replacing versionRange', () => {
            const content = 'Version Range: {versionRange}';
            const meta = {
                formattedVersionName: 'Laravel 10-11'
            };

            const result = configService.processTemplateVariables(content, meta);

            expect(result).toBe('Version Range: Laravel 10-11');
        });
    });

    describe('validateOptions', () => {
        it('should validate required options', () => {
            const mockConfig = {
                laravel: { /* config */ },
                nextjs: { /* config */ }
            };
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

            const options = {
                stack: 'laravel',
                outputDir: '/path/to/output'
            };

            const result = configService.validateOptions(options);

            expect(result.valid).toBe(true);
            expect(result.messages).toEqual([]);
        });

        it('should detect missing required options', () => {
            const options = {
                stack: 'laravel'
                // outputDir is missing
            };

            const result = configService.validateOptions(options);

            expect(result.valid).toBe(false);
            expect(result.messages).toContain('Output directory is required');
        });

        it('should detect unsupported stack', () => {
            const mockConfig = {
                laravel: { /* config */ },
                nextjs: { /* config */ }
            };
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

            const options = {
                stack: 'unsupported-stack',
                outputDir: '/path/to/output'
            };

            const result = configService.validateOptions(options);

            expect(result.valid).toBe(false);
            expect(result.messages).toContain('Stack "unsupported-stack" is not supported');
        });
    });

    describe('handleBackupOptions', () => {
        it('should return create action when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            const result = configService.handleBackupOptions('/path/to/rules');

            expect(result.action).toBe('create');
            expect(result.backupPath).toBe(null);
        });

        it('should return backup action with paths when directory exists', () => {
            fs.existsSync.mockReturnValue(true);

            const result = configService.handleBackupOptions('/path/to/rules');

            expect(result.action).toBe('backup');
            expect(result.backupPath).toContain('/path/to/rules-backup-');
            expect(result.originalPath).toBe('/path/to/rules');
        });
    });
}); 