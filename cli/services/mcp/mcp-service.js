/**
 * MCP Service for Agent Rules Kit
 * Manages Model Context Protocol tools installation and configuration
 */
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Service for handling MCP tools operations
 */
export class McpService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.configService = options.configService;
        this.fileService = options.fileService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Get available MCP tools from configuration
     * @returns {Array<Object>} List of available MCP tools with key, name, and description
     */
    getAvailableMcpTools() {
        const config = this.configService.loadKitConfig(this.templatesDir);
        const mcpTools = config.mcp_tools || {};

        return Object.keys(mcpTools).map(key => ({
            key,
            name: mcpTools[key].name,
            description: mcpTools[key].description
        }));
    }

    /**
     * Copy MCP tools rules to the specified directory
     * @param {string} rulesDir - Target rules directory
     * @param {Array<string>} selectedMcpTools - Array of selected MCP tool keys
     * @param {object} meta - Metadata for processing
     * @param {object} config - Configuration object
     * @returns {Promise<number>} - Number of MCP tool files copied
     */
    async copyMcpToolsRules(rulesDir, selectedMcpTools, meta, config) {
        // Get a reference to the file service
        const fileService = this.fileService || (this.configService?.fileService);
        if (!fileService) {
            throw new Error('File service is required but not available');
        }

        let totalFilesCopied = 0;

        // Create MCP tools directory
        const mcpToolsDir = path.join(rulesDir, 'mcp-tools');
        await this.ensureDirectoryExistsAsync(mcpToolsDir);

        // Process each selected MCP tool
        for (const mcpTool of selectedMcpTools) {
            const mcpToolTemplatesDir = path.join(this.templatesDir, 'mcp-tools', mcpTool);

            if (await this.pathExistsAsync(mcpToolTemplatesDir)) {
                // Create directory for this specific MCP tool
                const toolDir = path.join(mcpToolsDir, mcpTool);
                await this.ensureDirectoryExistsAsync(toolDir);

                // Get all .md files from the MCP tool directory
                const toolFiles = await fs.promises.readdir(mcpToolTemplatesDir);
                const mdFiles = toolFiles.filter(file => file.endsWith('.md'));

                // Process files in batches for better memory usage
                const batchSize = 10;
                for (let i = 0; i < mdFiles.length; i += batchSize) {
                    const batch = mdFiles.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (file) => {
                        const sourceFile = path.join(mcpToolTemplatesDir, file);
                        const destFile = path.join(toolDir, file.replace(/\.md$/, '.mdc'));

                        await fileService.wrapMdToMdcAsync(sourceFile, destFile, meta, config);
                        this.debugLog(`Copied MCP tool rule: ${mcpTool}/${file}`);
                        totalFilesCopied++;
                    }));
                }
            } else {
                this.debugLog(`MCP tool templates directory not found: ${mcpTool}`);
            }
        }

        return totalFilesCopied;
    }

    /**
     * Count MCP tools rules that will be generated
     * @param {Array<string>} selectedMcpTools - Array of selected MCP tool keys
     * @returns {Promise<number>} - Number of MCP tool files to be generated
     */
    async countMcpToolsRules(selectedMcpTools) {
        let totalFiles = 0;

        for (const mcpTool of selectedMcpTools) {
            const mcpToolTemplatesDir = path.join(this.templatesDir, 'mcp-tools', mcpTool);

            if (await this.pathExistsAsync(mcpToolTemplatesDir)) {
                const toolFiles = await fs.promises.readdir(mcpToolTemplatesDir);
                const mdFiles = toolFiles.filter(file => file.endsWith('.md'));
                totalFiles += mdFiles.length;
            }
        }

        return totalFiles;
    }

    /**
     * Check if a path exists asynchronously
     * @param {string} path - Path to check
     * @returns {Promise<boolean>} - True if exists, false otherwise
     */
    async pathExistsAsync(path) {
        try {
            await fs.access(path);
            return true;
        } catch (error) {
            this.debugLog(`Path does not exist: ${path}`);
            return false;
        }
    }

    /**
     * Ensure directory exists asynchronously
     * @param {string} dir - Directory path to create
     * @returns {Promise<void>}
     */
    async ensureDirectoryExistsAsync(dir) {
        try {
            await fs.ensureDir(dir);
            this.debugLog(`Directory ensured: ${dir}`);
        } catch (error) {
            this.debugLog(`Error ensuring directory ${dir}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate selected MCP tools
     * @param {Array<string>} selectedMcpTools - Array of selected MCP tool keys
     * @returns {Object} Validation result with status and messages
     */
    validateMcpTools(selectedMcpTools) {
        const result = {
            valid: true,
            messages: []
        };

        if (!Array.isArray(selectedMcpTools)) {
            result.valid = false;
            result.messages.push('Selected MCP tools must be an array');
            return result;
        }

        const availableTools = this.getAvailableMcpTools();
        const availableKeys = availableTools.map(tool => tool.key);

        const invalidTools = selectedMcpTools.filter(tool => !availableKeys.includes(tool));
        if (invalidTools.length > 0) {
            result.valid = false;
            result.messages.push(`Invalid MCP tools: ${invalidTools.join(', ')}`);
        }

        return result;
    }
} 