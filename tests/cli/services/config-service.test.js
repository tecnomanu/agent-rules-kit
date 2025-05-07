import * as fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../cli/services/config-service.js';

// Mock fs-extra correctamente
vi.mock('fs-extra', () => {
    return {
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        default: {
            existsSync: vi.fn(),
            readFileSync: vi.fn(),
            writeFileSync: vi.fn()
        }
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
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

            const result = configService.loadKitConfig(templatesDir);

            expect(fs.existsSync).toHaveBeenCalledWith(`${templatesDir}/config.json`);
            expect(fs.readFileSync).toHaveBeenCalledWith(`${templatesDir}/config.json`, 'utf8');
            expect(result).toEqual(mockConfig);
        });

        it('should return default config when file does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const defaultConfig = configService.getDefaultConfig();

            const result = configService.loadKitConfig(templatesDir);

            expect(fs.existsSync).toHaveBeenCalledWith(`${templatesDir}/config.json`);
            expect(configService.debugLog).toHaveBeenCalled();
            expect(result).toEqual(defaultConfig);
        });

        it('should handle JSON parse errors', () => {
            const errorSpy = vi.spyOn(console, 'error');
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('invalid json');

            const result = configService.loadKitConfig(templatesDir);

            expect(errorSpy).toHaveBeenCalled();
            expect(result).toEqual(configService.getDefaultConfig());
        });

        it('should cache configuration for subsequent calls', () => {
            const mockConfig = { test: 'config' };
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

            configService.loadKitConfig(templatesDir);
            fs.readFileSync.mockClear();

            // Segunda llamada debe usar el cache
            const result = configService.loadKitConfig(templatesDir);

            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(result).toEqual(mockConfig);
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
                `${templatesDir}/config.json`,
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
}); 