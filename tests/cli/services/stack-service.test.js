import * as fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StackService } from '../../../cli/services/stack-service.js';

// Mock fs-extra
vi.mock('fs-extra', () => {
    const mockPromises = {
        readdir: vi.fn().mockResolvedValue(['file1.md', 'file2.md']),
        writeFile: vi.fn().mockResolvedValue(),
        mkdir: vi.fn().mockResolvedValue(),
        access: vi.fn().mockResolvedValue(),
        stat: vi.fn().mockResolvedValue({ isDirectory: () => true })
    };

    const mockFunctions = {
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        statSync: vi.fn(() => ({ isDirectory: () => true })),
        readdirSync: vi.fn(),
        copySync: vi.fn(),
        access: vi.fn(),
        readdir: vi.fn(),
        writeFile: vi.fn(),
        copy: vi.fn(),
        promises: mockPromises
    };

    return {
        ...mockFunctions,
        __esModule: true,
        default: mockFunctions
    };
});

// Mock path
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return {
        ...actual,
        join: vi.fn((...args) => args.join('/')),
        resolve: vi.fn(path => path)
    };
});

describe('StackService', () => {
    let stackService;
    let mockConfigService;
    const templatesDir = '/test/templates';

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock config service
        mockConfigService = {
            loadKitConfig: vi.fn().mockReturnValue({
                laravel: {
                    version_ranges: {
                        '10': {
                            name: 'Laravel 10-11',
                            range_name: 'v10-11'
                        },
                        '11': {
                            name: 'Laravel 10-11',
                            range_name: 'v10-11'
                        },
                        '12': {
                            name: 'Laravel 12',
                            range_name: 'v12'
                        }
                    },
                    architectures: {
                        standard: {
                            name: 'Standard Laravel'
                        },
                        ddd: {
                            name: 'Domain-Driven Design'
                        }
                    }
                },
                nextjs: {
                    version_ranges: {
                        '13': {
                            name: 'Next.js 13',
                            range_name: 'v13'
                        },
                        '14': {
                            name: 'Next.js 14',
                            range_name: 'v14'
                        }
                    }
                },
                react: {
                    // Añadimos configuración para React que faltaba en las pruebas
                    version_ranges: {
                        '17': {
                            name: 'React 17',
                            range_name: 'v17'
                        },
                        '18': {
                            name: 'React 18',
                            range_name: 'v18'
                        }
                    }
                }
            })
        };

        stackService = new StackService({
            debug: true,
            configService: mockConfigService,
            templatesDir
        });

        stackService.debugLog = vi.fn();
    });

    describe('getAvailableStacks', () => {
        it('should return stacks from both config and template directories', () => {
            // Setup mocks
            fs.readdirSync.mockReturnValue(['laravel', 'nextjs', 'react']);
            fs.existsSync.mockReturnValue(true);

            const result = stackService.getAvailableStacks();

            expect(result).toContain('laravel');
            expect(result).toContain('nextjs');
            expect(result).toContain('react');
        });
    });

    describe('getAvailableArchitectures', () => {
        it('should return architectures with formatted names from config', () => {
            // Mock directory functions
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['standard', 'ddd']);

            const result = stackService.getAvailableArchitectures('laravel');

            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Standard Laravel');
            expect(result[0].value).toBe('standard');
            expect(result[1].name).toBe('Domain-Driven Design');
            expect(result[1].value).toBe('ddd');
        });
    });

    describe('detectStackVersion', () => {
        it('should detect Laravel version from composer.json', () => {
            // Setup mocks for Laravel detection
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValueOnce(JSON.stringify({
                require: {
                    'laravel/framework': '10.4.*'
                }
            }));

            const result = stackService.detectStackVersion('laravel', '/project');

            expect(result).toBe('10');
            expect(fs.readFileSync).toHaveBeenCalledWith('/project/composer.json', 'utf8');
        });

        it('should detect Next.js version from package.json', () => {
            // Setup mocks for Next.js detection
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValueOnce(JSON.stringify({
                dependencies: {
                    next: '13.4.12'
                }
            }));

            const result = stackService.detectStackVersion('nextjs', '/project');

            expect(result).toBe('13');
            expect(fs.readFileSync).toHaveBeenCalledWith('/project/package.json', 'utf8');
        });

        it('should return null when no version is found', () => {
            // Setup mocks for failed detection
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValueOnce(JSON.stringify({
                dependencies: {}
            }));

            const result = stackService.detectStackVersion('react', '/project');

            expect(result).toBe(null);
        });

        it('should return null when file is not found', () => {
            // Setup mocks for file not found
            fs.existsSync.mockReturnValue(false);

            const result = stackService.detectStackVersion('laravel', '/project');

            expect(result).toBe(null);
        });
    });

    describe('mapVersionToRange', () => {
        it('should map specific version to range with new structure', () => {
            const result = stackService.mapVersionToRange('laravel', '10');

            expect(result).toBe('v10-11');
            expect(mockConfigService.loadKitConfig).toHaveBeenCalled();
        });

        it('should return null for unknown versions', () => {
            const result = stackService.mapVersionToRange('laravel', '999');

            expect(result).toBe(null);
        });

        it('should handle null input', () => {
            const result = stackService.mapVersionToRange('laravel', null);

            expect(result).toBe(null);
        });
    });

    describe('getFormattedVersionName', () => {
        it('should return formatted name from config when version is a key', () => {
            const result = stackService.getFormattedVersionName('laravel', '10');

            expect(result).toBe('Laravel 10-11');
        });

        it('should return the name for range_name when versionRange is a range_name', () => {
            const result = stackService.getFormattedVersionName('laravel', 'v10-11');

            expect(result).toBe('Laravel 10-11');
        });

        it('should return default formatted version when not in config', () => {
            const result = stackService.getFormattedVersionName('unknown-stack', '999');

            expect(result).toBe('Unknown-stack 999');
        });

        it('should handle null input', () => {
            const result = stackService.getFormattedVersionName('laravel', null);

            expect(result).toBe(null);
        });
    });

    describe('formatRulesPath', () => {
        it('should format rules path correctly', () => {
            const result = stackService.formatRulesPath('/project');

            expect(result).toBe('/project/.cursor/rules/rules-kit');
        });

        it('should handle current directory', () => {
            const result = stackService.formatRulesPath('.');

            expect(result).toBe('.cursor/rules/rules-kit');
        });
    });

    describe('createBackup', () => {
        it('should create backup when directory exists', () => {
            // Mock for directory exists
            fs.existsSync.mockReturnValue(true);
            // Mock para asegurar que copySync es llamado
            fs.copySync.mockImplementation(() => { });

            const rulesDir = '/project/.cursor/rules/rules-kit';
            const result = stackService.createBackup(rulesDir);

            expect(fs.copySync).toHaveBeenCalled();
            expect(result).toContain(rulesDir + '-backup-');
        });

        it('should return null when directory does not exist', () => {
            // Mock for directory does not exist
            fs.existsSync.mockReturnValue(false);

            const result = stackService.createBackup('/not/exist');

            expect(fs.copySync).not.toHaveBeenCalled();
            expect(result).toBe(null);
        });

        it('should handle errors during backup', () => {
            // Mock for directory exists but copy fails
            fs.existsSync.mockReturnValue(true);
            fs.copySync.mockImplementation(() => {
                throw new Error('Copy failed');
            });

            const result = stackService.createBackup('/project/.cursor/rules/rules-kit');

            expect(result).toBe(null);
            expect(stackService.debugLog).toHaveBeenCalledWith(expect.stringContaining('Failed to create backup'));
        });
    });

    describe('generateRulesAsync', () => {
        let mockFileService;

        beforeEach(() => {
            // Mock fileService methods
            mockFileService = {
                wrapMdToMdcAsync: vi.fn().mockResolvedValue(),
                combineMdFiles: vi.fn().mockResolvedValue({
                    frontmatter: { globs: '<root>/tests/**/*.php', alwaysApply: false },
                    content: '# Combined Content'
                }),
                pathExists: vi.fn().mockResolvedValue(true)
            };

            // Provide fileService to stackService
            stackService.fileService = mockFileService;

            // Mock stackService methods
            stackService.pathExistsAsync = vi.fn().mockResolvedValue(true);
            stackService.ensureDirectoryExistsAsync = vi.fn().mockResolvedValue();

            // No need to re-mock fs-extra methods since they're already mocked globally
        });

        it('should detect and combine duplicate files from different locations', async () => {
            const rulesDir = '/project/rules';
            const meta = {
                stack: 'laravel',
                versionRange: 'v12',
                architecture: 'standard'
            };
            const config = { laravel: { globs: ['<root>/app/**/*.php'] } };
            const progressCallback = vi.fn();

            await stackService.generateRulesAsync(rulesDir, meta, config, progressCallback, false);

            // Verify that pathExistsAsync was called
            expect(stackService.pathExistsAsync).toHaveBeenCalled();

            // Verify that ensureDirectoryExistsAsync was called
            expect(stackService.ensureDirectoryExistsAsync).toHaveBeenCalled();

            // Verify that fs.promises.readdir was called
            expect(fs.promises.readdir).toHaveBeenCalled();

            // Verify that fs.promises.writeFile was called for the combined file
            expect(fs.promises.writeFile).toHaveBeenCalled();
        });

        it('should handle files that only exist in one location', async () => {
            // Mock fs.promises.readdir to return different files for each directory
            const mockReaddir = vi.fn().mockImplementation(async (dir) => {
                if (dir.includes('base')) {
                    return ['base_only.md', 'common_file.md'];
                } else if (dir.includes('v12')) {
                    return ['version_only.md', 'common_file.md'];
                } else {
                    return ['arch_only.md'];
                }
            });
            fs.promises.readdir = mockReaddir;

            const rulesDir = '/project/rules';
            const meta = {
                stack: 'laravel',
                versionRange: 'v12',
                architecture: 'standard'
            };
            const config = {};
            const progressCallback = vi.fn();

            await stackService.generateRulesAsync(rulesDir, meta, config, progressCallback, false);

            // Verify that fs.promises.readdir was called for each directory
            expect(mockReaddir).toHaveBeenCalled();

            // Verify that ensureDirectoryExistsAsync was called
            expect(stackService.ensureDirectoryExistsAsync).toHaveBeenCalled();

            // Verify that pathExistsAsync was called
            expect(stackService.pathExistsAsync).toHaveBeenCalled();
        });

        it('should include global rules when includeGlobalRules is true', async () => {
            // Mock fs methods for global rules
            const globalDir = '/test/templates/global';
            const mockReaddir = vi.fn().mockImplementation(async (dir) => {
                if (dir.includes('global')) {
                    return ['global1.md', 'global2.md'];
                } else {
                    return ['stack_file.md'];
                }
            });
            fs.promises.readdir = mockReaddir;

            const rulesDir = '/project/rules';
            const meta = { stack: 'laravel' };
            const config = { global: { always: ['global1.md'] } };
            const progressCallback = vi.fn();

            await stackService.generateRulesAsync(rulesDir, meta, config, progressCallback, true);

            // Verify that ensureDirectoryExistsAsync is called for the global directory
            expect(stackService.ensureDirectoryExistsAsync).toHaveBeenCalledWith(expect.stringContaining('global'));

            // Verify that wrapMdToMdcAsync is called for each global rule
            expect(mockFileService.wrapMdToMdcAsync).toHaveBeenCalledWith(
                expect.stringContaining('global1.md'),
                expect.any(String),
                expect.any(Object),
                expect.any(Object)
            );
        });

        it('should handle errors when combining files fails', async () => {
            // Mock combineMdFiles to throw an error
            mockFileService.combineMdFiles.mockRejectedValueOnce(new Error('Combine error'));

            const rulesDir = '/project/rules';
            const meta = { stack: 'laravel', versionRange: 'v12' };
            const config = {};

            // Mock multiple files with the same name in different directories
            const mockReaddir = vi.fn().mockResolvedValue(['duplicate.md']);
            fs.promises.readdir = mockReaddir;

            // We need to detect that debugLog is called with an error message
            stackService.debugLog = vi.fn();

            await stackService.generateRulesAsync(rulesDir, meta, config, vi.fn(), false);

            // Check that the error was logged
            expect(stackService.debugLog).toHaveBeenCalledWith(expect.stringContaining('Error merging files'));
        });
    });
}); 