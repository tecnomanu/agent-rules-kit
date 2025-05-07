/**
 * Laravel Service para Agent Rules Kit
 * Maneja operaciones específicas del stack Laravel
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Servicio específico para el stack Laravel
 */
export class LaravelService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copia reglas de arquitectura específicas
     * @param {string} architecture - Nombre de la arquitectura
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;

        // Usar la nueva estructura desde stacks/laravel/architectures
        const archDir = path.join(templatesDir, 'stacks/laravel/architectures', architecture);
        // Fallback a estructura antigua si la nueva no existe
        const oldArchDir = path.join(templatesDir, 'architectures/laravel', architecture);

        const sourceDir = this.fileService.directoryExists(archDir) ? archDir : oldArchDir;
        this.debugLog(`Buscando reglas de arquitectura en: ${sourceDir}`);

        if (this.fileService.directoryExists(sourceDir)) {
            const files = this.fileService.getFilesInDirectory(sourceDir);
            this.debugLog(`Encontrados ${files.length} archivos de arquitectura para procesar`);

            // Obtener configuración del kit para metadatos de reglas
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(sourceDir, f);
                // Escribir en carpeta de stack con prefijo de arquitectura
                const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
                // Almacenar en carpeta de stack
                const stackFolder = path.join(targetRules, 'laravel');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pasar metadata correcta incluyendo projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'laravel',
                    architecture: architecture,
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Procesado archivo de arquitectura: ${f}`);
            });

            console.log(`${chalk.green('✅')} Aplicadas reglas de arquitectura ${chalk.magenta(architecture)} para ${chalk.cyan('laravel')}`);
        } else {
            this.debugLog(`Directorio de arquitectura no existe: ${sourceDir}`);
        }
    }

    /**
     * Copia overlay de versiones específicas
     * @param {string} versionDir - Directorio de versión
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyVersionOverlay(versionDir, targetRules, options = {}) {
        if (!versionDir) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const overlayDir = path.join(templatesDir, 'stacks/laravel', versionDir);

        if (this.fileService.directoryExists(overlayDir)) {
            this.debugLog(`Aplicando overlay de laravel desde: ${overlayDir}`);
            const files = this.fileService.getFilesInDirectory(overlayDir);
            this.debugLog(`Encontrados ${files.length} archivos para procesar`);

            // Obtener configuración del kit para metadatos de reglas
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(overlayDir, f);
                // Escribir directamente al directorio de reglas con nombre de archivo prefijado para organización
                const fileName = `${f}`.replace(/\.md$/, '.mdc');
                // Almacenar en subcarpeta específica del stack
                const stackFolder = path.join(targetRules, 'laravel');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pasar metadata correcta incluyendo projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'laravel',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Procesado archivo de overlay: ${f}`);
            });

            console.log(`${chalk.green('✅')} Aplicadas reglas específicas de versión ${chalk.yellow(versionDir)} para ${chalk.cyan('laravel')}`);
        } else {
            this.debugLog(`Directorio de overlay no existe: ${overlayDir}`);
        }
    }

    /**
     * Copia reglas base de Laravel
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} versionMeta - Metadatos de versión
     * @param {Object} options - Opciones adicionales
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/laravel/base');
        this.debugLog(`Buscando reglas base en: ${baseDir}`);

        if (!this.fileService.directoryExists(baseDir)) {
            console.error(chalk.red(`❌ Directorio base no encontrado: ${baseDir}`));
            return false;
        }

        this.debugLog(`Encontrado directorio base con ${this.fileService.getFilesInDirectory(baseDir).length} archivos`);

        // Obtener configuración del kit para metadatos de reglas
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        // Iterar sobre archivos base y añadir path del proyecto e info de versión
        const baseFiles = this.fileService.getFilesInDirectory(baseDir);
        this.debugLog(`Procesando ${baseFiles.length} archivos base para laravel`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'laravel');
        this.fileService.ensureDirectoryExists(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Almacenar en carpeta de stack con nombre original
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            this.debugLog(`Copiando ${f} a ${fileName}`);

            // Metadata personalizada para cada archivo
            const fileMeta = {
                ...versionMeta,
                stack: 'laravel',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copiadas reglas base para ${chalk.cyan('laravel')}`);
        return true;
    }
} 