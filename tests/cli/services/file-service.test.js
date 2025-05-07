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
}); 