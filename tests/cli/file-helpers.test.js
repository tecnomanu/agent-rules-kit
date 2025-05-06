import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addFrontMatter, copyRuleGroup, processTemplateVariables, wrapMdToMdc } from '../../cli/utils/file-helpers.js';

// Mock fs-extra
vi.mock('fs-extra', () => {
    return {
        default: {
            readFileSync: vi.fn(),
            copyFileSync: vi.fn(),
            outputFileSync: vi.fn(),
            existsSync: vi.fn(),
            readdirSync: vi.fn()
        },
        readFileSync: vi.fn(),
        copyFileSync: vi.fn(),
        outputFileSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn()
    };
});

// Import fs after mocking
import fs from 'fs-extra';

describe('File Helpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('addFrontMatter', () => {
        it('should add front matter to markdown content', () => {
            const body = '# Test Markdown';
            const meta = { title: 'Test Title', stack: 'laravel', detectedVersion: '10' };

            const result = addFrontMatter(body, meta);

            expect(result).toContain('---');
            expect(result).toContain('title: Test Title');
            expect(result).toContain('stack: laravel');
            expect(result).toContain('detectedVersion: 10');
            expect(result).toContain('# Test Markdown');
        });
    });

    describe('processTemplateVariables', () => {
        it('should replace all template variables in content', () => {
            const content = '# Project using {stack} {detectedVersion} in {projectPath} with {versionRange}';
            const meta = {
                stack: 'laravel',
                detectedVersion: '10',
                versionRange: 'v10-11',
                projectPath: '/path/to/project'
            };

            const result = processTemplateVariables(content, meta);

            expect(result).toBe('# Project using laravel 10 in /path/to/project with v10-11');
        });

        it('should handle missing variables gracefully', () => {
            const content = 'Using {stack} version {detectedVersion}';
            const meta = { stack: 'nextjs' };

            const result = processTemplateVariables(content, meta);

            expect(result).toBe('Using nextjs version {detectedVersion}');
        });

        it('should return original content when no meta provided', () => {
            const content = 'Original content with {placeholders}';

            const result = processTemplateVariables(content);

            expect(result).toBe(content);
        });
    });

    describe('wrapMdToMdc', () => {
        it('should process template variables and add front matter', () => {
            const sourceContent = '# Project using {detectedVersion} in {projectPath}';
            const meta = {
                detectedVersion: '10',
                versionRange: 'v10-11',
                projectPath: '/path/to/project'
            };

            fs.readFileSync.mockReturnValue(sourceContent);

            wrapMdToMdc('source.md', 'dest.mdc', meta);

            const expectedContent = `---\ndetectedVersion: 10\nversionRange: v10-11\nprojectPath: /path/to/project\n---\n# Project using 10 in /path/to/project`;
            expect(fs.outputFileSync).toHaveBeenCalledWith('dest.mdc', expectedContent);
        });
    });

    describe('copyRuleGroup', () => {
        it('should copy files to docs directory with processed variables', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['file1.md', 'file2.md']);
            fs.readFileSync.mockReturnValue('# Doc for {stack}');

            const meta = { stack: 'nextjs' };
            copyRuleGroup('source/dir', 'docs/target/dir', meta);

            expect(fs.outputFileSync).toHaveBeenCalledTimes(2);
            expect(fs.outputFileSync).toHaveBeenCalledWith(
                path.join('docs/target/dir', 'file1.md'),
                '# Doc for nextjs'
            );
        });

        it('should not copy anything if source directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            copyRuleGroup('nonexistent/dir', 'target/dir');

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.outputFileSync).not.toHaveBeenCalled();
        });

        it('should convert to .mdc for non-docs directories', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['file1.md']);
            fs.readFileSync.mockReturnValue('# Test content');

            copyRuleGroup('source/dir', 'rules/dir');

            expect(fs.outputFileSync).toHaveBeenCalledTimes(1);
            expect(fs.outputFileSync).toHaveBeenCalledWith(
                path.join('rules/dir', 'file1.mdc'),
                expect.any(String)
            );
        });
    });
}); 