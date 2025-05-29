import fs from 'fs-extra';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { McpService } from '../../../cli/services/mcp/mcp-service.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
    default: {
        access: vi.fn(),
        ensureDir: vi.fn(),
        promises: {
            readdir: vi.fn()
        }
    }
}));

describe('McpService', () => {
    let mcpService;
    let mockConfigService;
    let mockFileService;
    let templatesDir;

    beforeEach(() => {
        templatesDir = '/test/templates';

        mockConfigService = {
            loadKitConfig: vi.fn()
        };

        mockFileService = {
            wrapMdToMdcAsync: vi.fn()
        };

        mcpService = new McpService({
            debug: false,
            configService: mockConfigService,
            fileService: mockFileService,
            templatesDir
        });
    });

    describe('getAvailableMcpTools', () => {
        it('should return available MCP tools from configuration', () => {
            const mockConfig = {
                mcp_tools: {
                    pampa: {
                        name: 'PAMPA - Semantic Code Search',
                        description: 'AI-powered semantic code search and project memory system'
                    },
                    github: {
                        name: 'GitHub - Repository Management',
                        description: 'Secure access to GitHub repositories for file operations'
                    }
                }
            };

            mockConfigService.loadKitConfig.mockReturnValue(mockConfig);

            const result = mcpService.getAvailableMcpTools();

            expect(result).toEqual([
                {
                    key: 'pampa',
                    name: 'PAMPA - Semantic Code Search',
                    description: 'AI-powered semantic code search and project memory system'
                },
                {
                    key: 'github',
                    name: 'GitHub - Repository Management',
                    description: 'Secure access to GitHub repositories for file operations'
                }
            ]);
        });

        it('should return empty array when no MCP tools configured', () => {
            const mockConfig = {};
            mockConfigService.loadKitConfig.mockReturnValue(mockConfig);

            const result = mcpService.getAvailableMcpTools();

            expect(result).toEqual([]);
        });
    });

    describe('validateMcpTools', () => {
        beforeEach(() => {
            const mockConfig = {
                mcp_tools: {
                    pampa: { name: 'PAMPA', description: 'Test' },
                    github: { name: 'GitHub', description: 'Test' }
                }
            };
            mockConfigService.loadKitConfig.mockReturnValue(mockConfig);
        });

        it('should validate correct MCP tools', () => {
            const result = mcpService.validateMcpTools(['pampa', 'github']);

            expect(result.valid).toBe(true);
            expect(result.messages).toEqual([]);
        });

        it('should reject invalid MCP tools', () => {
            const result = mcpService.validateMcpTools(['pampa', 'invalid']);

            expect(result.valid).toBe(false);
            expect(result.messages).toContain('Invalid MCP tools: invalid');
        });

        it('should reject non-array input', () => {
            const result = mcpService.validateMcpTools('not-an-array');

            expect(result.valid).toBe(false);
            expect(result.messages).toContain('Selected MCP tools must be an array');
        });
    });

    describe('countMcpToolsRules', () => {
        it('should count files from selected MCP tools', async () => {
            fs.promises.readdir.mockImplementation((dir) => {
                if (dir.includes('pampa')) {
                    return Promise.resolve(['rule1.md', 'rule2.md', 'other.txt']);
                }
                if (dir.includes('github')) {
                    return Promise.resolve(['rule3.md']);
                }
                return Promise.resolve([]);
            });

            // Mock pathExistsAsync to return true
            vi.spyOn(mcpService, 'pathExistsAsync').mockResolvedValue(true);

            const result = await mcpService.countMcpToolsRules(['pampa', 'github']);

            expect(result).toBe(3); // 2 from pampa + 1 from github
        });

        it('should skip non-existent tool directories', async () => {
            vi.spyOn(mcpService, 'pathExistsAsync').mockImplementation((path) => {
                return Promise.resolve(path.includes('pampa'));
            });

            fs.promises.readdir.mockImplementation((dir) => {
                if (dir.includes('pampa')) {
                    return Promise.resolve(['rule1.md']);
                }
                return Promise.resolve([]);
            });

            const result = await mcpService.countMcpToolsRules(['pampa', 'nonexistent']);

            expect(result).toBe(1); // Only pampa files counted
        });
    });

    describe('copyMcpToolsRules', () => {
        let rulesDir;
        let meta;
        let config;

        beforeEach(() => {
            rulesDir = '/test/rules';
            meta = { projectPath: './' };
            config = {};

            // Mock ensureDirectoryExistsAsync
            vi.spyOn(mcpService, 'ensureDirectoryExistsAsync').mockResolvedValue();
            vi.spyOn(mcpService, 'pathExistsAsync').mockResolvedValue(true);

            fs.promises.readdir.mockResolvedValue(['rule1.md', 'rule2.md']);
            mockFileService.wrapMdToMdcAsync.mockResolvedValue();
        });

        it('should copy MCP tool rules successfully', async () => {
            const selectedTools = ['pampa', 'github'];

            const result = await mcpService.copyMcpToolsRules(rulesDir, selectedTools, meta, config);

            expect(result).toBe(4); // 2 files per tool
            expect(mcpService.ensureDirectoryExistsAsync).toHaveBeenCalledWith(
                path.join(rulesDir, 'mcp-tools')
            );
            expect(mockFileService.wrapMdToMdcAsync).toHaveBeenCalledTimes(4);
        });

        it('should create tool-specific directories', async () => {
            const selectedTools = ['pampa'];

            await mcpService.copyMcpToolsRules(rulesDir, selectedTools, meta, config);

            expect(mcpService.ensureDirectoryExistsAsync).toHaveBeenCalledWith(
                path.join(rulesDir, 'mcp-tools', 'pampa')
            );
        });

        it('should skip non-existent tool directories', async () => {
            vi.spyOn(mcpService, 'pathExistsAsync').mockImplementation((path) => {
                return Promise.resolve(path.includes('pampa'));
            });

            const selectedTools = ['pampa', 'nonexistent'];

            const result = await mcpService.copyMcpToolsRules(rulesDir, selectedTools, meta, config);

            expect(result).toBe(2); // Only pampa files
        });

        it('should throw error when file service is not available', async () => {
            const mcpServiceNoFile = new McpService({
                debug: false,
                configService: mockConfigService,
                fileService: null,
                templatesDir
            });

            await expect(
                mcpServiceNoFile.copyMcpToolsRules(rulesDir, ['pampa'], meta, config)
            ).rejects.toThrow('File service is required but not available');
        });
    });

    describe('pathExistsAsync', () => {
        it('should return true when path exists', async () => {
            fs.access.mockResolvedValue();

            const result = await mcpService.pathExistsAsync('/test/path');

            expect(result).toBe(true);
            expect(fs.access).toHaveBeenCalledWith('/test/path');
        });

        it('should return false when path does not exist', async () => {
            fs.access.mockRejectedValue(new Error('ENOENT'));

            const result = await mcpService.pathExistsAsync('/test/path');

            expect(result).toBe(false);
        });
    });

    describe('ensureDirectoryExistsAsync', () => {
        it('should create directory successfully', async () => {
            fs.ensureDir.mockResolvedValue();

            await mcpService.ensureDirectoryExistsAsync('/test/dir');

            expect(fs.ensureDir).toHaveBeenCalledWith('/test/dir');
        });

        it('should throw error when directory creation fails', async () => {
            const error = new Error('Permission denied');
            fs.ensureDir.mockRejectedValue(error);

            await expect(
                mcpService.ensureDirectoryExistsAsync('/test/dir')
            ).rejects.toThrow('Permission denied');
        });
    });
}); 