import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAvailableArchitectures, LARAVEL_ARCHITECTURES, loadKitConfig, STACKS } from '../../cli/utils/config.js';

// Mock fs-extra
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn(),
            existsSync: vi.fn(),
            statSync: vi.fn(),
            readdirSync: vi.fn()
        },
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
        statSync: vi.fn(),
        readdirSync: vi.fn()
    };
});

// Import fs after mocking
import fs from 'fs-extra';

describe('Config Module', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('loadKitConfig', () => {
        it('should load configuration from kit-config.json', () => {
            const mockConfig = {
                version_ranges: {
                    laravel: { 8: 'v8-9', 9: 'v8-9' }
                }
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

            const result = loadKitConfig('/templates');

            expect(result).toEqual(mockConfig);
            expect(fs.existsSync).toHaveBeenCalledWith(path.join('/templates', 'kit-config.json'));
        });

        it('should return empty object if config file does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            const result = loadKitConfig('/templates');

            expect(result).toEqual({});
        });

        it('should handle JSON parse errors gracefully', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('invalid json');

            const result = loadKitConfig('/templates');

            expect(result).toEqual({});
        });
    });

    describe('getAvailableArchitectures', () => {
        it('should get architectures from the new location if available', () => {
            const templatesDir = '/templates';
            const stack = 'laravel';

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['standard', 'ddd', 'hexagonal']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            const result = getAvailableArchitectures(stack, templatesDir);

            expect(result.length).toBe(3);
            expect(result[0].value).toBe('standard');
            expect(fs.existsSync).toHaveBeenCalledWith(path.join(templatesDir, 'stacks', stack, 'architectures'));
        });

        it('should fallback to the old location if new location does not exist', () => {
            const templatesDir = '/templates';
            const stack = 'laravel';

            fs.existsSync.mockImplementation((path) => {
                return !path.includes('/stacks/laravel/architectures') && path.includes('/architectures/laravel');
            });
            fs.readdirSync.mockReturnValue(['standard', 'ddd']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            const result = getAvailableArchitectures(stack, templatesDir);

            expect(result.length).toBe(2);
            expect(result[0].value).toBe('standard');
            expect(fs.existsSync).toHaveBeenCalledWith(path.join(templatesDir, 'architectures', stack));
        });

        it('should return empty array for non-Laravel stacks', () => {
            const result = getAvailableArchitectures('nextjs', '/templates');

            expect(result).toEqual([]);
            expect(fs.existsSync).not.toHaveBeenCalled();
        });
    });

    describe('Constants', () => {
        it('should export stack constants', () => {
            expect(STACKS).toContain('laravel');
            expect(STACKS).toContain('nextjs');
            expect(STACKS).toContain('react');
            expect(STACKS).toContain('angular');
        });

        it('should export architecture options for Laravel', () => {
            expect(LARAVEL_ARCHITECTURES.length).toBeGreaterThan(0);
            expect(LARAVEL_ARCHITECTURES.find(a => a.value === 'standard')).toBeDefined();
            expect(LARAVEL_ARCHITECTURES.find(a => a.value === 'ddd')).toBeDefined();
            expect(LARAVEL_ARCHITECTURES.find(a => a.value === 'hexagonal')).toBeDefined();
        });
    });
}); 