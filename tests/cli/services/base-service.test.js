import * as fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseService } from '../../../cli/services/base-service.js';

// Mock fs-extra correctamente
vi.mock('fs-extra', () => {
    return {
        existsSync: vi.fn(),
        ensureDirSync: vi.fn(),
        readdirSync: vi.fn(),
        readFileSync: vi.fn(),
        outputFileSync: vi.fn(),
        copyFileSync: vi.fn(),
        default: {
            existsSync: vi.fn(),
            ensureDirSync: vi.fn(),
            readdirSync: vi.fn(),
            readFileSync: vi.fn(),
            outputFileSync: vi.fn(),
            copyFileSync: vi.fn()
        }
    }
});

// Mock console.log
console.log = vi.fn();

describe('BaseService', () => {
    let baseService;

    beforeEach(() => {
        vi.clearAllMocks();
        baseService = new BaseService({ debug: true });
    });

    describe('debugLog', () => {
        it('should log messages when debug is true', () => {
            baseService.debugLog('Test message');
            expect(console.log).toHaveBeenCalled();
        });

        it('should not log messages when debug is false', () => {
            const service = new BaseService({ debug: false });
            service.debugLog('Test message');
            expect(console.log).not.toHaveBeenCalled();
        });
    });

    describe('directoryExists', () => {
        it('should call fs.existsSync with correct path', () => {
            fs.existsSync.mockReturnValue(true);

            const result = baseService.directoryExists('/test/path');

            expect(fs.existsSync).toHaveBeenCalledWith('/test/path');
            expect(result).toBe(true);
        });
    });

    describe('ensureDirectoryExists', () => {
        it('should call fs.ensureDirSync with correct path', () => {
            baseService.ensureDirectoryExists('/test/path');

            expect(fs.ensureDirSync).toHaveBeenCalledWith('/test/path');
        });
    });

    describe('getFilesInDirectory', () => {
        it('should return files when directory exists', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt']);

            const result = baseService.getFilesInDirectory('/test/path');

            expect(fs.readdirSync).toHaveBeenCalledWith('/test/path');
            expect(result).toEqual(['file1.txt', 'file2.txt']);
        });

        it('should return empty array when directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            const result = baseService.getFilesInDirectory('/nonexistent/path');

            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('readFile', () => {
        it('should call fs.readFileSync with correct path and encoding', () => {
            fs.readFileSync.mockReturnValue('file content');

            const result = baseService.readFile('/test/file.txt');

            expect(fs.readFileSync).toHaveBeenCalledWith('/test/file.txt', 'utf8');
            expect(result).toBe('file content');
        });
    });

    describe('writeFile', () => {
        it('should call fs.outputFileSync with correct parameters', () => {
            baseService.writeFile('/test/file.txt', 'test content');

            expect(fs.outputFileSync).toHaveBeenCalledWith('/test/file.txt', 'test content');
        });
    });

    describe('copyFile', () => {
        it('should call fs.copyFileSync with correct parameters', () => {
            baseService.copyFile('/source/file.txt', '/dest/file.txt');

            expect(fs.copyFileSync).toHaveBeenCalledWith('/source/file.txt', '/dest/file.txt');
        });
    });
}); 