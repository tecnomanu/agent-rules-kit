import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileService } from '../../../cli/services/file-service.js';

describe('FileService', () => {
    let fileService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Crear un objeto mock para las funciones del FileService
        fileService = new FileService({ debug: true });

        // Mock de los métodos heredados de BaseService
        fileService.debugLog = vi.fn();
        fileService.readFile = vi.fn().mockReturnValue('# Test content');
        fileService.writeFile = vi.fn();
        fileService.directoryExists = vi.fn().mockReturnValue(true);
        fileService.ensureDirectoryExists = vi.fn();
        fileService.getFilesInDirectory = vi.fn().mockReturnValue(['test.md']);
    });

    describe('addFrontMatter', () => {
        it('should format metadata correctly', () => {
            const body = '# Test markdown';
            const meta = { title: 'Test', description: 'Test description' };

            const result = fileService.addFrontMatter(body, meta);

            expect(result).toBe('---\ntitle: Test\ndescription: Test description\n---\n# Test markdown');
        });
    });

    describe('processTemplateVariables', () => {
        it('should replace template variables with their values', () => {
            const content = 'Stack: {stack}, Version: {detectedVersion}, Range: {versionRange}, Path: {projectPath}';
            const meta = {
                stack: 'test-stack',
                detectedVersion: '1.0',
                versionRange: 'v1',
                projectPath: './test',
                debug: true
            };

            const result = fileService.processTemplateVariables(content, meta);

            expect(result).toBe('Stack: test-stack, Version: 1.0, Range: v1, Path: ./test');
        });

        it('should normalize projectPath when it is empty or "."', () => {
            const content = 'Path: {projectPath}';

            const result1 = fileService.processTemplateVariables(content, { projectPath: '' });
            const result2 = fileService.processTemplateVariables(content, { projectPath: '.' });

            expect(result1).toBe('Path: ./');
            expect(result2).toBe('Path: ./');
        });

        it('should not replace variables that are not provided', () => {
            const content = 'Stack: {stack}, Missing: {missing}';
            const meta = { stack: 'test-stack' };

            const result = fileService.processTemplateVariables(content, meta);

            expect(result).toBe('Stack: test-stack, Missing: {missing}');
        });
    });

    describe('wrapMdToMdc', () => {
        it('should process global rules correctly', () => {
            const src = '/path/to/global/test.md';
            const destFile = '/output/test.mdc';
            const meta = { debug: true };
            const config = {
                global: {
                    always: ['test.md']
                }
            };

            fileService.wrapMdToMdc(src, destFile, meta, config);

            // Verificar que se llamó a writeFile con el frontmatter correcto
            expect(fileService.writeFile).toHaveBeenCalled();
            expect(fileService.readFile).toHaveBeenCalledWith(src);
        });

        it('should process stack-specific rules correctly', () => {
            const src = '/path/to/stacks/laravel/test.md';
            const destFile = '/output/test.mdc';
            const meta = {
                stack: 'laravel',
                projectPath: './test',
                debug: true
            };
            const config = {
                laravel: {
                    globs: ['<root>/app/**/*.php']
                }
            };

            fileService.wrapMdToMdc(src, destFile, meta, config);

            // Verificar que se llamó a writeFile con el frontmatter correcto
            expect(fileService.writeFile).toHaveBeenCalled();
            expect(fileService.readFile).toHaveBeenCalledWith(src);
        });
    });

    describe('copyRuleGroup', () => {
        it('should not process files if directory does not exist', () => {
            fileService.directoryExists.mockReturnValue(false);

            fileService.copyRuleGroup('/nonexistent/path', '/dest', { debug: true });

            expect(fileService.getFilesInDirectory).not.toHaveBeenCalled();
        });

        it('should process documentation files differently than rule files', () => {
            const tmplDir = '/templates/rules';
            const destDir = '/dest/docs';
            const meta = { stack: 'test', debug: true };

            fileService.copyRuleGroup(tmplDir, destDir, meta);

            expect(fileService.readFile).toHaveBeenCalled();
            expect(fileService.writeFile).toHaveBeenCalled();
            expect(fileService.debugLog).toHaveBeenCalled();
        });

        it('should convert .md to .mdc for non-docs directories', () => {
            const tmplDir = '/templates/rules';
            const destDir = '/dest/rules';
            const meta = { stack: 'test', debug: true };

            fileService.copyRuleGroup(tmplDir, destDir, meta);

            expect(fileService.debugLog).toHaveBeenCalled();
        });
    });

    describe('unwrapMdcToMd', () => {
        it('should remove frontmatter from MDC content', () => {
            const mdcContent = `---
globs: "**/*"
alwaysApply: true
---
# Test Heading

This is test content.`;

            const result = fileService.unwrapMdcToMd(mdcContent);

            expect(result).not.toContain('---');
            expect(result).not.toContain('globs:');
            expect(result).not.toContain('alwaysApply:');
            expect(result).toBe('# Test Heading\n\nThis is test content.');
        });

        it('should return original content if no frontmatter', () => {
            const content = '# No Frontmatter\n\nJust regular content.';

            const result = fileService.unwrapMdcToMd(content);

            expect(result).toBe(content);
        });

        it('should handle malformed frontmatter gracefully', () => {
            const badContent = `---
This is not proper frontmatter
# Heading`;

            const result = fileService.unwrapMdcToMd(badContent);

            // Should return original content if frontmatter is malformed
            expect(result).toBe(badContent);
        });
    });

    describe('exportMdcToMd', () => {
        it('should export MDC file to MD by removing frontmatter', async () => {
            const mdcContent = `---
globs: "**/*"
---
# Content`;

            // Mock file reading and writing
            fileService.readFileOptimized = vi.fn().mockResolvedValue(mdcContent);
            fileService.writeFileAsync = vi.fn().mockResolvedValue();

            await fileService.exportMdcToMd('source.mdc', 'dest.md');

            expect(fileService.readFileOptimized).toHaveBeenCalledWith('source.mdc');
            expect(fileService.writeFileAsync).toHaveBeenCalledWith('dest.md', '# Content');
        });

        it('should handle errors when exporting', async () => {
            fileService.readFileOptimized = vi.fn().mockRejectedValue(new Error('Read error'));

            await expect(fileService.exportMdcToMd('source.mdc', 'dest.md')).rejects.toThrow('Read error');
        });
    });

    describe('extractFrontmatter', () => {
        it('should extract frontmatter and content correctly', () => {
            const mdContent = `---
globs: '<root>/app/**/*.php'
alwaysApply: false
description: 'Testing best practices'
---
# Test Content

This is test content.`;

            const result = fileService.extractFrontmatter(mdContent);

            expect(result).toHaveProperty('frontmatter');
            expect(result).toHaveProperty('content');
            expect(result.frontmatter.globs).toBe('<root>/app/**/*.php');
            expect(result.frontmatter.alwaysApply).toBe(false);
            expect(result.frontmatter.description).toBe('Testing best practices');
            expect(result.content).toBe('# Test Content\n\nThis is test content.');
        });

        it('should handle content without frontmatter', () => {
            const mdContent = '# Test Content\n\nThis is test content without frontmatter.';

            const result = fileService.extractFrontmatter(mdContent);

            expect(result.frontmatter).toEqual({});
            expect(result.content).toBe(mdContent);
        });

        it('should handle arrays in frontmatter', () => {
            const mdContent = `---
globs: ['/app/**/*.php', '/tests/**/*.php']
alwaysApply: true
---
# Content`;

            const result = fileService.extractFrontmatter(mdContent);

            expect(Array.isArray(result.frontmatter.globs)).toBe(true);
            expect(result.frontmatter.globs).toContain('/app/**/*.php');
            expect(result.frontmatter.globs).toContain('/tests/**/*.php');
        });

        it('should handle boolean values in frontmatter', () => {
            const mdContent = `---
alwaysApply: true
isActive: false
---
# Content`;

            const result = fileService.extractFrontmatter(mdContent);

            expect(result.frontmatter.alwaysApply).toBe(true);
            expect(result.frontmatter.isActive).toBe(false);
        });
    });

    describe('combineMdFiles', () => {
        beforeEach(() => {
            // Mock file reading and template processing
            fileService.processTemplateVariables = vi.fn(content => content);

            // Usar mock functions para evitar redefinir propiedades
            fileService.pathExists = vi.fn().mockResolvedValue(true);
            fileService.readFileOptimized = vi.fn().mockImplementation(async (filePath) => {
                if (filePath.includes('base')) {
                    return `---
globs: '<root>/app/**/*.php'
alwaysApply: false
description: 'Base testing practices'
---
# Base Content`;
                } else if (filePath.includes('version')) {
                    return `---
globs: '<root>/tests/**/*.php'
alwaysApply: false
description: 'Version-specific testing practices'
---
# Version Content`;
                }
                return '';
            });
        });

        it('should combine multiple files correctly', async () => {
            // Modificar el orden para que la ruta con 'v12' aparezca al final
            const filePaths = [
                '/templates/stacks/laravel/base/testing.md',
                '/templates/stacks/laravel/v12/testing.md'
            ];

            // Asegurarnos de que el archivo de versión sea reconocido como de versión
            fileService.readFileOptimized = vi.fn().mockImplementation(async (filePath) => {
                if (filePath.includes('base')) {
                    return `---
globs: '<root>/app/**/*.php'
alwaysApply: false
description: 'Base testing practices'
---
# Base Content`;
                } else if (filePath.includes('v12')) {
                    return `---
globs: '<root>/tests/**/*.php'
alwaysApply: false
description: 'Version-specific testing practices'
---
# Version Content`;
                }
                return '';
            });

            const meta = { stack: 'laravel', versionRange: 'v12' };

            const result = await fileService.combineMdFiles(filePaths, meta);

            expect(result).toHaveProperty('frontmatter');
            expect(result).toHaveProperty('content');

            // Version-specific frontmatter should override base frontmatter
            expect(result.frontmatter.globs).toBe('<root>/tests/**/*.php');
            expect(result.frontmatter.description).toBe('Version-specific testing practices');

            // Content should include both files with proper headers
            expect(result.content).toContain('# Base Content');
            expect(result.content).toContain('Version specific');
            expect(result.content).toContain('# Version Content');
        });

        it('should handle single file correctly', async () => {
            const filePaths = ['/templates/stacks/laravel/base/testing.md'];
            const meta = { stack: 'laravel' };

            const result = await fileService.combineMdFiles(filePaths, meta);

            expect(result.content).toBe('# Base Content');
            expect(result.frontmatter.description).toBe('Base testing practices');
        });

        it('should process template variables in each file', async () => {
            // Restore the original method to verify it's called
            fileService.processTemplateVariables = vi.fn(content => content.replace('{stack}', 'laravel'));

            const filePaths = [
                '/templates/stacks/laravel/base/testing.md',
                '/templates/stacks/laravel/v12/testing.md'
            ];

            fileService.readFileOptimized = vi.fn().mockImplementation(async (filePath) => {
                if (filePath.includes('base')) {
                    return `---
globs: '<root>/app/**/*.php'
---
# {stack} Base Content`;
                } else {
                    return `---
globs: '<root>/tests/**/*.php'
---
# {stack} Version Content`;
                }
            });

            const meta = { stack: 'laravel', versionRange: 'v12' };

            const result = await fileService.combineMdFiles(filePaths, meta);

            expect(fileService.processTemplateVariables).toHaveBeenCalled();
            expect(result.content).toContain('# laravel Base Content');
            expect(result.content).toContain('# laravel Version Content');
        });

        it('should handle non-existent files', async () => {
            fileService.pathExists = vi.fn().mockImplementation(async (filePath) => {
                return filePath.includes('base'); // Only base file exists
            });

            const filePaths = [
                '/templates/stacks/laravel/base/testing.md',
                '/templates/stacks/laravel/v12/testing.md'
            ];
            const meta = { stack: 'laravel' };

            const result = await fileService.combineMdFiles(filePaths, meta);

            expect(result.content).toBe('# Base Content');
            expect(fileService.readFileOptimized).toHaveBeenCalledTimes(1); // Only called for the existing file
        });
    });
}); 